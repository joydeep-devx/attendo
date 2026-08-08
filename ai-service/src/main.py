import opencv2 as cv
import numpy as np

cam = cv.VideoCapture(0)

while True:
    ret, frame = cam.read()
    if not ret:
        break

    gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    cv.imshow('Video Feed', gray)

    if cv.waitKey(1) & 0xFF == ord('q'):
        break
    