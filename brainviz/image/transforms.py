import scipy.ndimage

def resize(image_data, new_x, new_y, new_z):
    
    if(len(image_data.shape) == 3):
        transform_matrix = [(image_data.shape[0] - 1) * 1.0/new_x,
            (image_data.shape[1] - 1) * 1.0 /new_y,
            (image_data.shape[2] - 1) * 1.0 / new_z]
    else:
        transform_matrix = [(image_data.shape[0] - 1) * 1.0/new_x,
            (image_data.shape[1] - 1) * 1.0 /new_y,
            (image_data.shape[2] - 1) * 1.0 / new_z, 1]
    new_shape = [new_x, new_y, new_z]
    return scipy.ndimage.affine_transform(image_data, transform_matrix,
                output_shape=new_shape)
