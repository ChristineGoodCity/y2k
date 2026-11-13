<?php
/** Install editable navigation fields and copy the old menu once. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
if (!acf_get_field_group('group_y2k_navigation')) {
    acf_import_field_group([
        'key'=>'group_y2k_navigation', 'title'=>'Header navigation', 'active'=>true,
        'fields'=>[[
            'key'=>'field_y2k_header_links', 'name'=>'header_links', 'label'=>'Header navigation',
            'type'=>'repeater', 'layout'=>'table', 'button_label'=>'Add link',
            'instructions'=>'Drag rows to reorder the header links. Use a page path, an anchor, or a full URL.',
            'sub_fields'=>[
                ['key'=>'field_y2k_header_link_title', 'name'=>'title', 'label'=>'Label', 'type'=>'text', 'required'=>1],
                ['key'=>'field_y2k_header_link_url', 'name'=>'url', 'label'=>'Link', 'type'=>'text', 'required'=>1, 'placeholder'=>'/#intro'],
            ],
        ]],
        'location'=>[[['param'=>'options_page','operator'=>'==','value'=>'y2k-site-settings']]],
    ]);
}
if (get_option('options_header_links', null) === null) {
    $locations=get_nav_menu_locations();
    $links=[];
    foreach (wp_get_nav_menu_items($locations['header'] ?? 0) ?: [] as $item) {
        $links[]=['field_y2k_header_link_title'=>$item->title,'field_y2k_header_link_url'=>$item->url];
    }
    update_field('field_y2k_header_links',$links,'option');
    echo 'Copied '.count($links)." header links.\n";
}
echo "ACF navigation ready.\n";
