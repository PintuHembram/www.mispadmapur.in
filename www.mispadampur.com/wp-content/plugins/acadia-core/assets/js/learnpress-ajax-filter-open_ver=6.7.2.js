;(function($){
    "use strict";
    
    var formDataFilter = {};
    var paged = 1;
    var tax_val = wp_vars.course_tax_page;
    var term_id = wp_vars.current_term_id;
    
    $(document).on('change', '.archive_filter_3 select', function(){
        
        var formData = {};
        paged = 1;
        formData['paged'] = paged;
        if(1 == paged){
            $('.ac-lp-archive-load-more-3').css('display', 'inline-block');
        }

        // sort by
        var sort_by = $('select[name="sort_by"]').val() || '';
        if (sort_by !== '') {
            formData['sort_by'] = sort_by;
        }

        // categories
        // var categories = $('select[name="categories"]').val() || '';
        // if (categories !== '') {
        //     formData['categories'] = categories;
        // }

        let categories = [];
        $('select[name="categories"]').each(function(){
            categories.push($(this).val());
        });
        if(categories.length > 0 && categories[0] != 0){
            formData['categories'] = categories;
        }else{
            formData['categories'] = '';
        }

        // instructors
        // var instructors = $('select[name="instructors"]').val() || '';
        // if (instructors !== '') {
        //     formData['instructors'] = instructors;
        // }

        let instructors = [];
        $('select[name="instructors"]').each(function(){
            instructors.push($(this).val());
        });
        if(instructors.length > 0 && instructors[0] != 0){
            formData['instructors'] = instructors;
        }else{
            formData['instructors'] = '';
        }

        let skills = [];
        $('select[name="skills"]').each(function(){
            skills.push($(this).val());
        });
        if(skills.length > 0 && skills[0] != 0){
            formData['skills'] = skills;
        }else{
            formData['skills'] = '';
        }

        // sort_by_price
        var sort_by_price = $('select[name="sort_by_price"]').val() || '';
        if (sort_by_price !== '') {
            formData['sort_by_price'] = sort_by_price;
        }

        // Generate a nonce and add it to formData
        let nonce = wp_vars_filter_open.nonce;
        formData['nonce'] = nonce;

        let urlParams = buildUrlParams(formData);
        let newUrl = window.location.origin + window.location.pathname + '?' + urlParams;
        window.history.pushState(null, null, newUrl);

        // formData['action'] = 'ac_learnpress_filter_open_ajax_course';

        ajax_filter_open_post_fetch(formData, '[data-ac-course-filter-open-content]', '[data-ac-course-filter-open-content-list]');

    })

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
    window.ajax_filter_open_post_fetch = (params, result, result_list) => {
        $.ajax({
            url: wp_vars_filter_open.ajaxurl,
            type: 'POST',
            data: {
                ...params,
                action: 'ac_learnpress_filter_open_ajax_course'
            },
            beforeSend:function(){
                block($(result));
                block($(result_list));
            },
            success:function(res){
                $(result).html(res?.data?.results);
                $(result_list).html(res?.data?.results_list);

                // res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                // $('.total-courses span').text($('.tp-course-grid-item').length);

                // if(0 == res?.data?.total_posts){
                //     $('[data-total-courses]').html('<p>Showing 1 - 0 courses of 0 results</p>');
                // }

                if(0 < res?.data?.total_posts){
                    $('.lp-filter-open-result').html(res?.data?.totals);
                    $('.lp-filter-open-result .total-courses span').text($('.lp-acadia-archive-filter-open .tp-course-grid-item').length);
                } else {
                    $('.lp-filter-open-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.lp-double-result').html(res?.data?.totals);
                    $('.lp-double-result .total-courses span').text($('.lp-acadia-archive-filter-double .tp-course-grid-item').length);
                } else {
                    $('.lp-double-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-filter-open-result').html(res?.data?.totals);
                    $('.ms-filter-open-result .total-courses span').text($('.ms-acadia-archive-filter-open .tp-course-grid-item').length);
                } else {
                    $('.ms-filter-open-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-double-result').html(res?.data?.totals);
                    $('.ms-double-result .total-courses span').text($('.ms-acadia-archive-filter-double .tp-course-grid-item').length);
                } else {
                    $('.ms-double-result p').text('No result found');
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
    $(document).on('keyup', '.ac-archive-filter-open-search-form .course_search', function(e) {
        $('.ac-lp-archive-load-more-3').css('display', 'inline-block');
        // Get the value from the input field
        let searchValue = $(this).val().trim();
        // Get the current base URL (without query parameters)
        let baseUrl = window.location.origin + window.location.pathname;

        if (searchValue != '' && searchValue.length > 0) {
            // Update the URL with the new query parameter
            let newUrl = baseUrl + '?search_for=' + encodeURIComponent(searchValue);
            
            // Update the browser URL without reloading the page
            window.history.pushState(null, null, newUrl);

            if (e.keyCode == 13) { // Trigger form submission on Enter key
                $('.ac-archive-filter-open-search-form').submit();
            }

            search_filter_open_ajax_fetch_post(searchValue, '[data-ac-course-filter-open-content]', '[data-ac-course-filter-open-content-list]')

            // Perform the AJAX search
            // search_ajax_fetch_post(searchValue, '[data-ac-course-content]', '[data-ac-course-content-list]');
        } else {
            // If the input is cleared (e.g., Ctrl + A + Backspace), reset the URL to the base URL
            window.history.pushState(null, null, baseUrl);

            search_filter_open_ajax_fetch_post('', '[data-ac-course-filter-open-content]', '[data-ac-course-filter-open-content-list]')
            
            // Optionally, trigger the default search or reset action
            // search_ajax_fetch_post('', '[data-ac-course-content]', '[data-ac-course-content-list]');
        }
        formData['search_for'] = searchValue;
        paged = 1;
        formData['paged'] = paged;
    });

    window.search_filter_open_ajax_fetch_post = (sarch_val, result, results_list) => {
        $.ajax({
            url: wp_vars.ajaxurl,
            type: 'POST',
            data: {
                action: 'ac_learnpress_filter_open_ajax_course',
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
                // $('.total-courses span').text($('.tp-course-grid-item').length);

                if(0 < res?.data?.total_posts){
                    $('.lp-filter-open-result').html(res?.data?.totals);
                    $('.lp-filter-open-result .total-courses span').text($('.lp-acadia-archive-filter-open .tp-course-grid-item').length);
                } else {
                    $('.lp-filter-open-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.lp-double-result').html(res?.data?.totals);
                    $('.lp-double-result .total-courses span').text($('.lp-acadia-archive-filter-double .tp-course-grid-item').length);
                } else {
                    $('.lp-double-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-filter-open-result').html(res?.data?.totals);
                    $('.ms-filter-open-result .total-courses span').text($('.ms-acadia-archive-filter-open .tp-course-grid-item').length);
                } else {
                    $('.ms-filter-open-result p').text('No result found');
                }

                if(0 < res?.data?.total_posts){
                    $('.ms-double-result').html(res?.data?.totals);
                    $('.ms-double-result .total-courses span').text($('.ms-acadia-archive-filter-double .tp-course-grid-item').length);
                } else {
                    $('.ms-double-result p').text('No result found');
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

    $(document).on('click', '.ac-lp-archive-load-more-3', function(e){
        e.preventDefault();
        paged++;
        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);
        // formData['action'] = 'ac_learnpress_filter_open_ajax_course';
        if( params.get('sort_by') != null ){
            formDataFilter['sort_by'] = params.get('sort_by');
        }
        if( params.get('search_for') != null ){
            formDataFilter['search_for'] = params.get('search_for');
        }
        if( params.get('categories') != null ){
            formDataFilter['categories'] = params.get('categories').split(',');
        }else{
            formDataFilter['categories'] = [];
        }
        if( params.get('instructors') != null){
            formDataFilter['instructors'] = params.get('instructors').split(',');
        }else{
            formDataFilter['instructors'] = [];
        }
        if( params.get('skills') != null){
            formDataFilter['skills'] = params.get('skills').split(',');
        }else{
            formDataFilter['skills'] = [];
        }
        if( params.get('paged') != null ){
            formDataFilter['paged'] = params.get('paged') || paged;
        }
        if( params.get('sort_by_price') != null ){
            formDataFilter['sort_by_price'] = params.get('sort_by_price');
        }
        formDataFilter['paged'] = paged;
        ajax_filter_open_post_fetch_load(formDataFilter, '[data-ac-course-filter-open-content]', '[data-ac-course-filter-open-content-list]');
    });

    window.ajax_filter_open_post_fetch_load = (params, result, result_list) => {
        $.ajax({
            url: wp_vars_filter_open.ajaxurl,
            type: 'POST',
            data: {
                ...params,
                action : 'ac_learnpress_filter_open_ajax_course',
                tax_val: tax_val,
                term_id: term_id
            },
            beforeSend:function(){
                block($(result));
                block($(result_list));
            },
            success:function(res){
                $(result).append(res?.data?.results);
                $(result_list).append(res?.data?.results_list);
                res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                $('.total-courses span').text($('.tp-course-grid-item').length);
                if(0 == res.data.total_pagi){
                    $('.ac-lp-archive-load-more-3').css('display', 'none');
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