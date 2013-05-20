""" (XXX)
"""

import libcchdo.fns


def uniq(array, ):
    deduped = []
    for item in array:
        if item not in deduped:
            deduped.append(item)
    return deduped


def any_to_track_json(infile, ):
    EMPTY = ""

    if not infile:
        print "no file"
        return EMPTY

    try:
        datafile = libcchdo.fns.read_arbitrary(infile,
                file_name=str(infile.filename))
    except Exception as e:
        import traceback
        traceback.print_exc(e)
        return EMPTY

    if datafile is None:
        print "libcchdo.fns.read_arbitrary() >>> None"
        return EMPTY

    if "LATITUDE" not in datafile.columns:
        print '"LATITUDE" not in datafile.columns'
        return EMPTY

    if "LONGITUDE" not in datafile.columns:
        print '"LONGITUDE" not in datafile.columns'
        return EMPTY

    track = zip(
            map(float, datafile.columns["LONGITUDE"].values),
            map(float, datafile.columns["LATITUDE"].values))
    track = uniq(track)

    import json
    return json.dumps(track)


def valid_bounds_in(kwargs, ):
    projection = "merc" if "projection" not in kwargs else kwargs["projection"]
    if projection in ("npstere", "spstere", ):
        return "bounds_elliptical" in kwargs
    else:
        return all([bound in kwargs for bound in
                ("bounds_cylindrical_north", "bounds_cylindrical_south",
                "bounds_cylindrical_east", "bounds_cylindrical_west", )])


def bounds_argument_from(kwargs, ):
    projection = "merc" if "projection" not in kwargs else kwargs["projection"]
    if projection in ("npstere", "spstere", ):
        return ["--bounds_elliptical", kwargs["bounds_elliptical"], ]
    else:
        return ["--bounds-cylindrical",
                str(kwargs["bounds_cylindrical_west"]),  # lower left longitude
                str(kwargs["bounds_cylindrical_south"]), # lower left latitude
                str(kwargs["bounds_cylindrical_east"]),  # upper right longitude
                str(kwargs["bounds_cylindrical_north"]), # upper right latitude
        ]


def hydro_plot_etopo(trackjson, kwargs):
    cmd = ["hydro", "plot", "etopo", ]

    # Extract the track data from the hidden form input.
    # If it's been tampered with, leave it blank.
    try:
        import json
        track = json.loads(trackjson)
    except ValueError:
        track = []

    # Make sure the boundary arguments are all present.
    if not valid_bounds_in(kwargs):
        return None

    # Add the plot width.
    cmd.append("--width")
    cmd.append(kwargs["width"] if "width" in kwargs else "720")

    # Add the option to fill continents, if requested.
    if "fill_continents" in kwargs:
        cmd.append("--fill-continents")

    # Add the projection.
    cmd.append("--projection")
    cmd.append(kwargs["projection"] if "projection" in kwargs else "merc")

    # Add the colormap.
    cmd.append("--cmap")
    cmd.append(kwargs["cmap"] if "cmap" in kwargs else "cberys")

    # Add the plot title.
    if "title" in kwargs:
        cmd.append("--title")
        cmd.append(kwargs["title"])

    # Add the plot boundaries.
    cmd += bounds_argument_from(kwargs)

    # Make a temporary directory for the stuff.
    import os.path
    import tempfile
    tmpdir = tempfile.mkdtemp()

    # Create filenames for the temporary track storage and the generated image.
    trackfile = os.path.join(tmpdir, "na.txt")
    bigimage = os.path.join(tmpdir, "etopo.png")

    # Write the track to the temporary file.
    with open(trackfile, "w") as f:
        print >> f, "\n".join(["%f %f" % tuple(point) for point in track])

    # Add the filenames to the arguments.
    cmd += ["--output-filename", bigimage, "--any-file", trackfile, ]

    # ===== DO THIS LAST =====
    # Add the ETOPO resolution positional argument.
    try:
        etopo_resolution = int(kwargs["etopo_resolution"]) \
                if "etopo_resolution" in kwargs \
                else 5
    except ValueError:
        etopo_resolution = 5
    cmd.append("--no-etopo" if int(etopo_resolution) == -1
            else str(etopo_resolution))

    # NO ADDING OF ARGUMENTS ALLOWED HERE

    # Run hydro-plot-etopo.
    import subprocess
    if subprocess.call(cmd) != 0:
        return None

    return tmpdir


def image_bounds_from(form, ):
    coords = ["x1", "y1", "x2", "y2"]
    if not all([param in form for param in coords]):
        return (0, 0, 0, 0)
    return tuple(map(int, [form[param] for param in coords]))


def synthesize_archive(tmpdir, form, ):
    import os.path
    import zipfile
    import StringIO
    import PIL.Image

    bigimage = os.path.join(tmpdir, "etopo.png")
    smallimage = os.path.join(tmpdir, "thumb.png")
    buf = StringIO.StringIO()
    zf = zipfile.ZipFile(buf)

    try:
        # This fails if the tmpdir isn't valid.
        zf.write(bigimage, "etopo.png")
    except:
        zf.close()
        buf.close()
        return (None, 404)

    try:
        img = PIL.Image.open(bigimage)
        # Maybe there are invalid bounds?
        thumb = img.crop(image_bounds_from(form))
    except:
        zf.close()
        buf.close()
        return (None, 500)

    # If we've gotten this far, we've probably made sure that the tmpdir
    # exists (because we read the big image from it).
    with open(smallimage, "w") as f:
        thumb.save(f)

    # Write the cropped image.
    zf.write(smallimage, "thumb.png")
    zf.close()

    content = buf.getvalue()
    buf.close()
    return (content, 200)
