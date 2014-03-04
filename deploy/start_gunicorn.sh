#!/bin/bash
set -e
LOGFILE=/var/log/gunicorn/opendata.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=3
USER=ldinh
GROUP=ldinh

cd /home/ldinh/opendata
test -d $LOGDIR || mkdir -p $LOGDIR

exec gunicorn opendata.wsgi -w $NUM_WORKERS --user=$USER --group=$GROUP --log-level=debug --log-file=$LOGFILE --bind=0.0.0.0:8080 2>>$LOGFILE
