;(function($){
    "use strict";
    // Initialize the formDataFilter object
    var formDataFilter = {};
    var paged = 1;
    var tax_val = wp_vars.course_tax_page;
    var term_id = wp_vars.current_term_id;

    $(document).on('change', '.tp-grid-sidebar-left input[type="checkbox"]', function(){
        var formData = {};
        paged = 1;
        formData['paged'] = paged;
        if(0 < paged){
            $('.ac-lp-archive-load-more').css('display', 'inline-block');
        }

        // Collect checked categories checkboxes (assuming name="categories")
        let categories = [];
        $('input[name="categories"]:checked').each(function() {
            categories.push($(this).val()); // Keep value as string
        });
        
        if (categories.length > 0) {
            formData['categories'] = categories;
        }
    
         // Collect checked instructor checkboxes (assuming name="instructors")
        let instructors = [];
        $('input[name="instructors"]:checked').each(function() {
            instructors.push(parseInt($(this).val())); // Convert value to integer
        });
      
        if (instructors.length > 0) {
            formData['instructors'] = instructors;
        }

        // Collect checked skill checkboxes (assuming name="skills")
        let skills = [];
        $('input[name="skills"]:checked').each(function() {
            skills.push($(this).val()); // Keep value as string
        });
        if (skills.length > 0) {
            formData['skills'] = skills;
        }

        // Collect rating and price_sort (assuming they are radio buttons)
        let ratings = [];
        $('input[name="rating"]:checked').each(function() {
            ratings.push($(this).val()); // Keep value as string
        });

        if (ratings.length > 0) {
            formData['rating'] = ratings;
        }
        // let rating = $('input[name="rating"]:checked').val();
        let priceSort = $('input[name="sort_by"]:checked').val();

        document.addEventListener('DOMContentLoaded', function () {
            // Get the checkboxes
            const freeCheckbox = document.getElementById('sort_on_free');
            const paidCheckbox = document.getElementById('sort_on_paid');
        
            // Add event listeners to checkboxes
            freeCheckbox.addEventListener('change', function () {
                if (freeCheckbox.checked) {
                    paidCheckbox.checked = false; // Uncheck the other checkbox
                }
            });
        
            paidCheckbox.addEventListener('change', function () {
                if (paidCheckbox.checked) {
                    freeCheckbox.checked = false; // Uncheck the other checkbox
                }
            });
        });              

        // if (rating) {
        //     formData['rating'] = rating;
        // }

        if (priceSort) {
            formData['sort_by'] = priceSort;
        }
        // Generate a nonce and add it to formData
        let nonce = wp_vars.nonce; // Assume wp_vars.nonce contains the nonce value from the localize script
        formData['nonce'] = nonce;

        // console.log(formData);
        let urlParams = buildUrlParams(formData);
        // Set the new URL without reloading the page
        let newUrl = window.location.origin + window.location.pathname + '?' + urlParams;
        window.history.pushState(null, null, newUrl);

        // Log the result
        // console.log('Updated URL:', newUrl);
        // window.location.reload();

        ajax_fetch_post(formData, '[data-ac-course-content]');

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


    $(document).on('click', '.clear-filters', function(){
        let baseUrl = window.location.origin + window.location.pathname;

        // Use history.pushState to update the URL without reloading the page
        window.history.pushState(null, null, baseUrl);
        window.location.reload();
    });


    // ajax search
    $(document).on('keyup', '.tp-course-grid-sidebar-search .course_search', function(e) {

        $('.ac-lp-archive-load-more').css('display', 'inline-block');
        
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
                $('.ac-sidebar-search-form').submit();
            }

            // Perform the AJAX search
            search_ajax_fetch_post(searchValue, '[data-ac-course-content]', '[data-ac-course-content-list]');
        } else {
            // If the input is cleared (e.g., Ctrl + A + Backspace), reset the URL to the base URL
            window.history.pushState(null, null, baseUrl);

            // Optionally, trigger the default search or reset action
            search_ajax_fetch_post('', '[data-ac-course-content]', '[data-ac-course-content-list]');
        }

        formDataFilter['search_for'] = searchValue;
    });

    $(document).on('click', '.ac-lp-archive-load-more', function(e){
        e.preventDefault();
        paged++;
        var url = new URL(window.location.href);
        var params = new URLSearchParams(url.search);

        if( params.get('search_for') != null ){
            formDataFilter['search_for'] = params.get('search_for');
        }
        if( params.get('instructors') != null){
            formDataFilter['instructors'] = params.get('instructors').split(',');
        }
        if( params.get('skills') != null ){
            formDataFilter['skills'] = params.get('skills').split(',');
        }
        if( params.get('categories') != null ){
            formDataFilter['categories'] = params.get('categories').split(',');
        }
        if( params.get('rating') != null ){
            formDataFilter['rating'] = params.get('rating').split(',');
        }
        if( params.get('sort_by') != null ){
            formDataFilter['sort_by'] = params.get('sort_by');
        }
        if( params.get('paged') != null ){
            formDataFilter['paged'] = params.get('paged') || paged;
        }
        formDataFilter['paged'] = paged;
        ajax_load_post(formDataFilter, '[data-ac-course-content]');
        
    });

    window.ajax_load_post = (params, result) => {
        $.ajax({
            url: wp_vars.ajaxurl,
            type: 'POST',
            data:{
                ...params,
                action:'ac_learnpress_ajax_course',
                tax_val : tax_val,
                term_id : term_id
            },
            beforeSend:function(){
                block($(result));
                block($('[data-ac-course-content-list]'));
            },
            success:function(res){
                $(result).append(res?.data?.results);
                $('[data-ac-course-content-list]').append(res?.data?.results_list);
                res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                $('.total-courses span').text($('.tp-course-item').length);

                if(0 == res.data.total_pagi){
                    $('.ac-lp-archive-load-more').css('display', 'none');
                }
            },
            complete: function(){
                unblock($(result));
                unblock($('[data-ac-course-content-list]'));
            },
            error:function(err){
                console.log(err);
            }
        })
    }


    window.search_ajax_fetch_post = (sarch_val, result, results_list) => {
        $.ajax({
            url: wp_vars.ajaxurl,
            type: 'POST',
            data: {
                action: 'ac_learnpress_ajax_course',
                search_for: sarch_val
            },
            beforeSend: function(){
                block($(result));
                block($(results_list));
            },
            success: function(res){
                $(result).html(res?.data?.results);
                $(results_list).html(res?.data?.results_list);
                $('[data-total-courses]').html(res?.data?.totals);
                $('.total-courses span').text($('.tp-course-item').length);
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

    window.ajax_fetch_post = (params, result) => {
        $.ajax({
            url: wp_vars.ajaxurl,
            type: 'POST',
            data:{
                ...params,
                action:'ac_learnpress_ajax_course'
            },
            beforeSend:function(){
                block($(result));
                block($('[data-ac-course-content-list]'));
            },
            success:function(res){
                $(result).html(res?.data?.results);
                $('[data-ac-course-content-list]').html(res?.data?.results_list);
                res?.data?.total_posts > 0 && $('[data-total-courses]').html(res?.data?.totals);
                $('.total-courses span').text($('.tp-course-item').length);

                if(0 == res?.data?.total_posts){
                    $('[data-total-courses]').html('<p>Showing 1 - 0 courses of 0 results</p>');
                }
            },
            complete: function(){
                unblock($(result));
                unblock($('[data-ac-course-content-list]'));
            },
            error:function(err){
                console.log(err);
            }
        })
    }

    window.is_blocked = function( $node ) {
        return $node.is( '.processing' ) || $node.parents( '.processing' ).length;
    };
    
    window.block = function( $node ) {
        if ( ! is_blocked( $node ) ) {
            // Add the processing class
            $node.addClass( 'processing' );
    
            // Create an overlay div
            var overlay = $('<div class="block-overlay"></div>');
            var message = $('<div class="block-message">Processing...</div>');
    
            // Append the overlay and message to the node
            $node.append(overlay).append(message);
        }
    };
    
    window.unblock = function( $node ) {
        // Remove the processing class and the overlay
        setTimeout(function(){
            $node.removeClass( 'processing' ).find( '.block-overlay, .block-message' ).remove();
        }, 2000);
    };
    

})(jQuery);