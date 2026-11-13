<?php
/** Add editable gallery titles and populate missing titles from image filenames. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
$cards = acf_get_field('field_builder_gallery_cards');
if (!$cards) throw new RuntimeException('Gallery fields are missing.');
if (!acf_get_field('field_builder_gallery_title')) {
    acf_update_field([
        'key'=>'field_builder_gallery_title', 'name'=>'title', 'label'=>'Title',
        'type'=>'text', 'parent'=>$cards['ID'], 'menu_order'=>1,
    ]);
    acf_get_store('fields')->reset();
}
foreach (get_posts(['post_type'=>'page', 'post_status'=>'any', 'numberposts'=>-1]) as $page) {
    $rows = get_field('field_page_builder', $page->ID, false) ?: [];
    $changed = false;
    foreach ($rows as &$row) {
        if ($row['acf_fc_layout'] !== 'gallery') continue;
        foreach ($row['field_builder_gallery_cards'] as &$card) {
            if (!empty($card['field_builder_gallery_title'])) continue;
            $filename = pathinfo(parse_url($card['field_builder_gallery_image'], PHP_URL_PATH), PATHINFO_FILENAME);
            $card['field_builder_gallery_title'] = ucwords(str_replace('-', ' ', $filename));
            $changed = true;
        }
        unset($card);
    }
    unset($row);
    if ($changed) {
        update_field('field_page_builder', $rows, $page->ID);
        echo "Added gallery titles on page {$page->ID}.\n";
    }
}
