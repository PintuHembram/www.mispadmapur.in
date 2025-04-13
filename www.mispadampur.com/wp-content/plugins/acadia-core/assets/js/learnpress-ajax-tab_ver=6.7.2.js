;(function($){
    "use strict";

    var formDataFilter = {};
    var formData = {};
    var paged = 1;
    var tax_val = wp_vars.course_tax_page;
    var term_id = wp_vars.current_term_id;

    // Function to get URL parameters and populate formData
    function getUrlParams() {
        let params = new URLSearchParams(window.location.search);
        
        // Check if sort_by exists in the URL
        if (params.has('sort_by')) {
            formData['sort_by'] = params.get('sort_by');
            $('select[name="sort_by"]').val(params.get('sort_by')); // Preselect the dropdown value
        }

        // Check if categories exist in the URL
        if (params.has('categories')) {
            formData['categories'] = params.get('categories');
            // Preselect the correct category based on data-slug
            $('.tp-course-grid-box input[data-slug="' + params.get('categories') + '"]').addClass('active');
        }

        // Add nonce from a global object like `wp_vars_tab`
        formData['nonce'] = wp_vars_tab.nonce;
    }

    // Call the function to populate formData on page load
    getUrlParams();

    $(document).on('change', '.lp-archive-tab .tp-course-filter-select select, .ms-acadia-archive-tab .tp-course-filter-select select', function() {
        paged = 1;
        formData['paged'] = paged;
        if(1 == paged){
            $('.ac-lp-archive-load-more-4').css('display', 'inline-block');
        }
        // sort by
        var sort_by = $('select[name="sort_by"]').val() || '';
        if (sort_by !== '') {
            formData['sort_by'] = sort_by;
        }

        // Add nonce
        formData['nonce'] = wp_vars_tab.nonce;

        // Build and update the URL
        let urlParams = buildUrlParams(formData);
        let newUrl = window.location.origin + window.location.pathname + '?' + urlParams;
        window.history.pushState(null, null, newUrl);
        ajax_tab_post_fetch(formData, '[data-ac-course-tab]', '[data-ac-course-tab-list]');
    });

    $(document).on('click', '.lp-archive-tab .tp-course-grid-box input[type="button"], .ms-acadia-archive-tab .tp-course-grid-box input[type="button"]', function() {

        console.log('hi');

        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);
        if( params.get('categories') != null ){
            formDataFilter['categories'] = params.get('categories');
        }
        if( params.get('paged') != null ){
            formDataFilter['paged'] = params.get('paged') || paged;
        }
        paged = 1;
        formDataFilter['paged'] = paged;
        if(1 == paged){
            $('.ac-lp-archive-load-more-4').css('display', 'inline-block');
        }

        // Get category data-slug from the clicked button
        var categories = $(this).attr('data-slug') || '';
        if (categories !== '') {
            formDataFilter['categories'] = categories;
        }

        // Add nonce
        formDataFilter['nonce'] = wp_vars_tab.nonce;

        // Build and update the URL
        let urlParams = buildUrlParams(formDataFilter);
        let newUrl = window.location.origin + window.location.pathname + '?' + urlParams;
        window.history.pushState(null, null, newUrl);
        ajax_tab_post_fetch(formDataFilter, '[data-ac-course-tab]', '[data-ac-course-tab-list]');
    });

    function buildUrlParams(data) {
        let params = [];

        for (let key in data) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
                // Join array values by commas if it's non-empty
                params.push(`${key}=${data[key].join(',')}`);
            } else if (data[key] !== null && data[key] !== '') {
                // Add single values (like rating) only if they are not null or empty
                params.push(`${key}=${data[key]}`);
            }
        }

        return params.join('&');
    }

    // filter bar
    window.ajax_tab_post_fetch = (params, result, result_list) => {
        $.ajax({
            url: wp_vars_tab.ajaxurl,
            type: 'POST',
            data: {
                ...params,
                action: 'ac_learnpress_tab_ajax_course'
            },
            beforeSend:function(){
                block($(result));
                block($(result_list));
            },
            success:function(res){
                $(result).html(res?.data?.results);
                $(result_list).html(res?.data?.results_list);

                // res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                // $('.total-courses span').text($('.tp-course-item').length);

                // if(0 == res?.data?.total_posts){
                //     $('[data-total-courses]').html('<p>Showing 1 - 0 courses of 0 results</p>');
                // }

                if(0 < res?.data?.total_posts){
                    $('.lp-tab-result').html(res?.data?.totals);
                    $('.lp-tab-result .total-courses span').text($('.lp-archive-tab .tp-course-item').length);
                } else {
                    $('.lp-tab-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-tab-result').html(res?.data?.totals);
                    $('.ms-tab-result .total-courses span').text($('.ms-acadia-archive-tab .tp-course-item').length);
                } else {
                    $('.ms-tab-result p').text('No result found');
                }
            },
            complete: function(){
                unblock($(result));
                unblock($(result_list));
            },
            error:function(err){
                console.log(err);
            }
        })
    }

    // ajax search
    $(document).on('keyup', '.ac-archive-filter-tab-search-form .course_search', function(e) {
        $('.ac-lp-archive-load-more-4').css('display', 'inline-block');
        // Get the value from the input field
        let searchValue = $(this).val().trim();
        // Get the current base URL (without query parameters)
        let baseUrl = window.location.origin + window.location.pathname;

        if (searchValue != '' && searchValue.length > 0) {
            // Update the URL with the new query parameter
            let newUrl = baseUrl + '?search_for=' + encodeURIComponent(searchValue) + '&paged=1';
            
            // Update the browser URL without reloading the page
            window.history.pushState(null, null, newUrl);

            if (e.keyCode == 13) { // Trigger form submission on Enter key
                $('.ac-archive-filter-tab-search-form').submit();
            }

            search_filter_tab_ajax_fetch_post(searchValue, '[data-ac-course-tab]', '[data-ac-course-tab-list]')

            // Perform the AJAX search
            // search_ajax_fetch_post(searchValue, '[data-ac-course-content]', '[data-ac-course-content-list]');
        } else {
            // If the input is cleared (e.g., Ctrl + A + Backspace), reset the URL to the base URL
            window.history.pushState(null, null, baseUrl);

            search_filter_tab_ajax_fetch_post('', '[data-ac-course-tab]', '[data-ac-course-tab-list]')
            
            // Optionally, trigger the default search or reset action
            // search_ajax_fetch_post('', '[data-ac-course-content]', '[data-ac-course-content-list]');
        }
        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);
        if( params.get('search_for') != null ){
            formDataFilter['search_for'] = params.get('search_for');
        }
        if( params.get('paged') != null ){
            formDataFilter['paged'] = params.get('paged') || paged;
        }
        formDataFilter['search_for'] = searchValue;
        paged = 1;
        formDataFilter['paged'] = paged;
    });

    window.search_filter_tab_ajax_fetch_post = (sarch_val, result, results_list) => {
        $.ajax({
            url: wp_vars.ajaxurl,
            type: 'POST',
            data: {
                action: 'ac_learnpress_tab_ajax_course',
                search_for: sarch_val
            },
            beforeSend: function(){
                block($(result));
                block($(results_list));
            },
            success: function(res){
                $(result).html(res?.data?.results);
                $(results_list).html(res?.data?.results_list);

                // res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                // $('.total-courses span').text($('.tp-course-item').length);

                if(0 < res?.data?.total_posts){
                    $('.lp-tab-result').html(res?.data?.totals);
                    $('.lp-tab-result .total-courses span').text($('.lp-archive-tab .tp-course-item').length);
                } else {
                    $('.lp-tab-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-tab-result').html(res?.data?.totals);
                    $('.ms-tab-result .total-courses span').text($('.ms-acadia-archive-tab .tp-course-item').length);
                } else {
                    $('.ms-tab-result p').text('No result found');
                }
            },
            complete: function(){
                unblock($(result));
                unblock($(results_list));
            },
            error:function(err){
                console.log(err);
            }
        });
    }

    $(document).on('click', '.ac-lp-archive-load-more-4', function(e){
        e.preventDefault();
        paged++;
        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);
        if( params.get('search_for') != null ){
            formDataFilter['search_for'] = params.get('search_for');
        }
        if( params.get('categories') != null ){
            formDataFilter['categories'] = params.get('categories');
        }
        if( params.get('paged') != null ){
            formDataFilter['paged'] = params.get('paged') || paged;
        }
        if( params.get('sort_by') != null ){
            formDataFilter['sort_by'] = params.get('sort_by') || '';
        }
        formDataFilter['paged'] = paged;
        ajax_tab_post_fetch_load(formDataFilter, '[data-ac-course-tab]', '[data-ac-course-tab-list]');
    });

    window.ajax_tab_post_fetch_load = (params, result, result_list) => {
        $.ajax({
            url: wp_vars_tab.ajaxurl,
            type: 'POST',
            data: {
                ...params,
                action: 'ac_learnpress_tab_ajax_course',
                tax_val : tax_val,
                term_id : term_id
            },
            beforeSend:function(){
                block($(result));
                block($(result_list));
            },
            success:function(res){
                $(result).append(res?.data?.results);
                $(result_list).append(res?.data?.results_list);
                res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                $('.total-courses span').text($('.tp-course-item').length);
                if(0 == res.data.total_pagi){
                    $('.ac-lp-archive-load-more-4').css('display', 'none');
                }
            },
            complete: function(){
                unblock($(result));
                unblock($(result_list));
            },
            error:function(err){
                console.log(err);
            }
        })
    }


})(jQuery);