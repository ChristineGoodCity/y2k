<?php
/** One-time, repeatable migration: stable ACF keys preserve values while names change. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
$field = acf_get_field('field_page_builder');
if (!$field) throw new RuntimeException('Page builder is missing.');
$changes = [];
foreach ($field['layouts'] as $layout) {
    foreach ($layout['sub_fields'] as $sub) {
        $prefix = $layout['name'] . '_';
        if (str_starts_with($sub['name'], $prefix)) {
            $changes[] = [$sub, substr($sub['name'], strlen($prefix))];
        }
        if ($sub['type'] === 'repeater') foreach ($sub['sub_fields'] as $card) {
            if (str_starts_with($card['name'], 'collection_card_')) $changes[] = [$card, substr($card['name'], 16)];
        }
    }
}
if (!$changes) { echo "Field names already simplified.\n"; return; }
$pages = get_posts(['post_type'=>'page','post_status'=>array_keys(get_post_stati()),'numberposts'=>-1]);
$values = [];
$old_keys = [];
foreach ($pages as $page) {
    $values[$page->ID] = get_field('field_page_builder', $page->ID, false) ?: [];
    $old_keys[$page->ID] = array_values(array_filter(array_keys(get_post_meta($page->ID)), fn($key) => preg_match('/^_?page_builder_\d+_(intro_|collection_)/', $key)));
}
file_put_contents('/tmp/y2k-before-field-simplification.json', wp_json_encode($values));
foreach ($changes as [$sub, $name]) { $sub['name']=$name; acf_update_field($sub); }
// A fresh field tree is needed after renaming nested fields.
acf_get_store('fields')->reset();
acf_get_store('values')->reset();
foreach ($values as $id=>$rows) {
    update_field('field_page_builder', $rows, $id);
    acf_get_store('values')->reset();
    $saved=get_field('field_page_builder',$id,false) ?: [];
    if ($saved != $rows) throw new RuntimeException("Content verification failed for page $id; source metadata retained.");
    foreach ($old_keys[$id] as $key) delete_post_meta($id,$key);
    echo "Verified page $id: ".count($rows)." sections.\n";
}
echo "Renamed fields and preserved all nested content.\n";
