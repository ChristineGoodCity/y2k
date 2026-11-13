<?php
/** Install editable page-builder definitions once; preserve subsequent CMS changes. */
if (!defined('ABSPATH')) require '/var/www/html/wp-load.php';
if (!function_exists('acf_is_pro') || !acf_is_pro()) {
    throw new RuntimeException('The page builder requires ACF Pro.');
}
if (!acf_get_field_group('group_y2k_page_builder')) {
    $schema = json_decode(file_get_contents(WP_PLUGIN_DIR . '/y2k-headless/page-builder.json'), true, 512, JSON_THROW_ON_ERROR);
    acf_import_field_group($schema);
}
echo "Page builder ready.\n";
