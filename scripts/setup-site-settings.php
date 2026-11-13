<?php
/** Seed editable ACF configuration once; never overwrite later admin edits. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
if (!acf_get_ui_options_page('ui_options_page_y2k_site')) {
    acf_import_ui_options_page([
        'key'=>'ui_options_page_y2k_site',
        'title'=>'Site settings', 'page_title'=>'Site settings', 'menu_title'=>'Site settings',
        'menu_slug'=>'y2k-site-settings', 'active'=>true,
        'advanced_configuration'=>true, 'capability'=>'edit_pages',
        'redirect'=>false, 'icon_url'=>'dashicons-admin-site-alt3',
        'data_storage'=>'options', 'post_id'=>'options',
    ]);
}
// Check the database, not a previously registered PHP-local group.
if (!acf_get_field_group_post('group_y2k_page')) {
    acf_import_field_group([
        'key'=>'group_y2k_page', 'title'=>'Page settings', 'active'=>true, 'show_in_rest'=>true,
        'fields'=>[[
            'key'=>'field_y2k_description', 'name'=>'y2k_description',
            'label'=>'Search description', 'type'=>'textarea', 'rows'=>3,
        ]],
        'location'=>[[['param'=>'post_type','operator'=>'==','value'=>'page']]],
    ]);
}
echo "Site settings and Page settings are managed in ACF.\n";
