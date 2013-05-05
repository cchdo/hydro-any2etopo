""" (XXX0
"""

import libcchdo.fns


def any_to_track_json(infile, ):
    EMPTY = ""

    if not infile:
        print "no file"
        return EMPTY

    try:
        datafile = libcchdo.fns.read_arbitrary(infile, infile.filename)
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

    import json
    return json.dumps(zip(
            map(float, datafile.columns["LATITUDE"].values),
            map(float, datafile.columns["LONGITUDE"].values)))
