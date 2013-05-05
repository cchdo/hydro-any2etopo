#!/usr/bin/env python

import flask
import util


app = flask.Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def main():
    if flask.request.method == "GET":
        track_as_json = ""
    elif flask.request.method == "POST":
        if "datafile" in flask.request.files:
            track_as_json = util.any_to_track_json(
                    flask.request.files["datafile"])
        else:
            track_as_json = ""

    return flask.render_template("index.html", trackjson=track_as_json)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)
