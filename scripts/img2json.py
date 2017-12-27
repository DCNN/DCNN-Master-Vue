"""This script extract the pixel matrix from a png image.

Provide data for our DCNN project
"""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import os
import json

from PIL import Image


BASE_DIR = './static/cifar-10/'
TARGET_DIR = BASE_DIR + 'test-imgs/'
DEST_DIR = BASE_DIR + 'test-imgs-data/'

def get_files_from_dir(path):
    """Get files.
    """
    f_list = []
    files = os.listdir(path)
    for a_file in files:
        if os.path.splitext(a_file)[-1] == '.png':
            f_list.append(path + a_file)
    return f_list


def extract_image_pixels_from(file_path):
    """Extract the Image Matrix.

    return a 3D tensor ([height][width][channel])
    """
    img = Image.open(file_path)
    pixels = list(img.getdata())
    tensor_3d = []
    for row_index in range(img.height):
        from_to = (row_index * img.width, (row_index + 1) * img.width)
        tensor_3d.append(pixels[from_to[0]:from_to[1]])
    return tensor_3d


def export_to_json_file(tensor, file_path):
    """Export a tensor to a json file.
    """
    with open(file_path, 'w') as f:
        f.write(json.dumps(tensor))


if __name__ == '__main__':
    tensor_4d = []  # [batch_size][height][width][channel]
    for a_img in get_files_from_dir(TARGET_DIR):
        tensor_4d.append(extract_image_pixels_from(a_img))
    export_to_json_file(tensor_4d, DEST_DIR + 'data.json')
