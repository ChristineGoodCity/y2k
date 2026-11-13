<?php
/** Add Gallery without replacing existing layouts or page content. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
$field = acf_get_field('field_page_builder');
if (!$field) throw new RuntimeException('Page builder is missing.');
if (!acf_get_field('field_builder_gallery_cards')) {
    $field['layouts'] = array_filter($field['layouts'], fn($layout) => $layout['name'] !== 'gallery');
    $schema = json_decode(file_get_contents(WP_PLUGIN_DIR . '/y2k-headless/page-builder.json'), true, 512, JSON_THROW_ON_ERROR);
    foreach ($schema['fields'][0]['layouts'] as $layout) {
        if ($layout['name'] === 'gallery') $field['layouts'][] = $layout;
    }
    $group = acf_get_field_group('group_y2k_page_builder');
    $group['fields'] = acf_get_fields($group);
    foreach ($group['fields'] as &$group_field) {
        if ($group_field['key'] === 'field_page_builder') $group_field = $field;
    }
    unset($group_field);
    acf_import_field_group($group);
    acf_get_store('fields')->reset();
}
$id = (int) get_option('page_on_front');
if (!$id) return;
$rows = get_field('field_page_builder', $id, false) ?: [];
if (array_filter($rows, fn($row) => $row['acf_fc_layout'] === 'gallery' && !empty($row['field_builder_gallery_cards']))) {
    echo "Gallery already exists; preserved its content.\n";
    return;
}
$rows = array_values(array_filter($rows, fn($row) => $row['acf_fc_layout'] !== 'gallery'));
$cards = [];
foreach ([
    ['barbie.jpg', 'Barbie game room with arcade games', 600, 360],
    ['barbie-2.jpg', 'Barbie.com makeover, fairy and Baby Krissy games', 1280, 720],
    ['tamagochi-town.webp', 'Colorful map of Tamagotchi Town', 1000, 666],
    ['my-scene.jpg', 'My Scene makeover game with pink and blue hair', 540, 416],
    ['polly-pocket.jpg', 'Polly Pocket Beautiful Bedroom decorating game', 1036, 809],
] as [$file, $alt, $width, $height]) {
    $cards[] = ['field_builder_gallery_image'=>'/gallery/'.$file, 'field_builder_gallery_title'=>ucwords(str_replace('-', ' ', pathinfo($file, PATHINFO_FILENAME))), 'field_builder_gallery_alt'=>$alt, 'field_builder_gallery_width'=>$width, 'field_builder_gallery_height'=>$height];
}
$rows[] = ['acf_fc_layout'=>'gallery', 'field_builder_gallery_number'=>'3', 'field_builder_gallery_label'=>'gallery', 'field_builder_gallery_anchor'=>'gallery', 'field_builder_gallery_sublabel'=>'', 'field_builder_gallery_cards'=>$cards];
update_field('field_page_builder', $rows, $id);
echo "Added Gallery with five images.\n";
