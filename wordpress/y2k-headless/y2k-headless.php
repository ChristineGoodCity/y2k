<?php
/**
 * Plugin Name: Y2K Headless Builder
 * Description: Inline ACF page builder, WPGraphQL delivery.
 * Version: 0.1.0
 */
if (!defined("ABSPATH")) {
    exit();
}
require_once __DIR__ . "/model-uploads.php";
add_action("init", function () {
    remove_post_type_support("page", "editor");
});
add_action("graphql_register_types", function () {
    register_graphql_field("RootQuery", "y2kSite", [
        "type" => "String",
        "resolve" => function () {
            $links = [];
            foreach (get_field("header_links", "option") ?: [] as $item) {
                $url = $item["url"] ?? "";
                if (str_starts_with($url, home_url("/"))) {
                    $url = "/" . substr($url, strlen(home_url("/")));
                }
                $url = esc_url_raw($url, ["http", "https", "mailto", "tel"]);
                if ($url) {
                    $links[] = ["title" => $item["title"] ?? "", "url" => $url];
                }
            }
            return wp_json_encode([
                "title" => get_bloginfo("name"),
                "links" => $links,
            ]);
        },
    ]);
});
