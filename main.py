#!/usr/bin/env python

import base64
import flask
import util


app = flask.Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def main():
    if flask.request.method == "GET":
        track_as_json = ""
        filename = "No datafile selected."
    elif flask.request.method == "POST":
        if "datafile" in flask.request.files:
            track_as_json = util.any_to_track_json(
                    flask.request.files["datafile"])
            filename = flask.request.files["datafile"].filename
        else:
            track_as_json = ""
            filename = "No datafile selected."

    return flask.render_template("index.html",
            datafile_name=filename,
            trackjson=track_as_json)


@app.route("/big/<t>")
def bigimage(t):
    import os.path
    imgname = os.path.join(base64.urlsafe_b64decode(str(t)), "etopo.png")
    try:
        with open(imgname, "r") as f:
            img = f.read()
            resp = flask.make_response(img)
            resp.headers["Content-Type"] = "image/png"
            resp.headers["Content-Length"] = len(img)
            return resp
    except:
        flask.abort(404)


@app.route("/download/<t>", methods=["POST"])
def download(t):
    tmpdir = base64.urlsafe_b64decode(t)

    # Crop the image and synthesize the image archive.
    content, respcode = util.synthesize_archive(t, flask.request.form)
    if respcode is not 200:
        flask.abort(respcode)

    # Synthesize the response.
    resp = flask.make_response(content)
    resp.headers["Content-Type"] = "application/zip"
    resp.headers["Content-Length"] = len(content)
    resp.headers["Content-Disposition"] = "attachment;filename=\"etopo.zip\""

    # Clean up.
    import shutil
    shutil.rmtree(tmpdir, ignore_errors=True)
    return resp


@app.route("/crop", methods=["POST"])
def cropper():
    def to_start(with_error=None):
        return flask.redirect("/")

    if "trackjson" not in flask.request.form:
        print "no trackjson"
        return to_start()

    tmpdir = util.hydro_plot_etopo(flask.request.form["trackjson"],
            flask.request.form)
    if tmpdir is None:
        return to_start(with_error="util.hydro_plot_etopo() failed")

    return flask.render_template("crop.html",
            tmpdir_as_base64=base64.urlsafe_b64encode(tmpdir), )


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
