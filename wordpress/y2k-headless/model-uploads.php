<?php
/** Allow GLB models while retaining WordPress's normal upload checks. */
add_filter('upload_mimes', function ($mimes) {
    $mimes['glb'] = 'model/gltf-binary';
    return $mimes;
});
add_filter('wp_check_filetype_and_ext', function ($result, $file, $filename, $mimes) {
    if (strtolower(pathinfo($filename, PATHINFO_EXTENSION)) !== 'glb') {
        return $result;
    }
    $allowed = wp_check_filetype($filename, $mimes);
    $header = is_readable($file) ? file_get_contents($file, false, null, 0, 12) : false;
    $valid = false;
    if ($header !== false && strlen($header) === 12) {
        $data = unpack('a4magic/Vversion/Vlength', $header);
        $valid = $data['magic'] === 'glTF' && $data['version'] === 2 && $data['length'] === filesize($file);
    }
    return [
        'ext' => $valid && $allowed['ext'] ? 'glb' : false,
        'type' => $valid && $allowed['type'] ? 'model/gltf-binary' : false,
        'proper_filename' => false,
    ];
}, 10, 4);
