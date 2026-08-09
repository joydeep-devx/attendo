import cv2


def start_camera():

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        raise RuntimeError(
            "Could not open webcam"
        )

    return camera


def get_frame(camera):

    success, frame = camera.read()

    if not success:
        return None

    return frame


def stop_camera(camera):

    camera.release()

    cv2.destroyAllWindows()