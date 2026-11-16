<?php
/** Install editable navigation fields for site setup. */
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
echo "ACF navigation ready.\n";
