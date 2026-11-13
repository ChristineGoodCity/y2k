<?php
if (get_option("y2k_seeded")) {
    return;
}
$id = wp_insert_post([
    "post_type" => "page",
    "post_title" => "Y2K — A more colorful tomorrow",
    "post_name" => "home",
    "post_status" => "publish",

]);
$field = acf_get_field('field_page_builder');
$rows = [];
foreach ($field['layouts'] as $layout) {
    if ($layout['name'] === 'gallery') continue; // Populated by setup-gallery.php.
    $row = ['acf_fc_layout' => $layout['name']];
    foreach ($layout['sub_fields'] as $subfield) {
        $row[$subfield['key']] = $subfield['type'] === 'repeater' ? [] : ($subfield['default_value'] ?? '');
    }
    $rows[] = $row;
}
update_field('field_page_builder', $rows, $id);
update_option("show_on_front", "page");
update_option("page_on_front", $id);
update_post_meta(
    $id,
    "y2k_description",
    "A visual journey through the tech, fashion, music and games that shaped a generation.",
);
update_field('field_y2k_header_links', [[
    'field_y2k_header_link_title'=>'Introduction',
    'field_y2k_header_link_url'=>'/#intro',
]], 'option');
update_option("y2k_seeded", true);
