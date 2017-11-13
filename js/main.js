(function ($, Toc, instantsearch) {
    $(function () {
        initToc();
        initDocSearch();
        transformBlockquotes();
    });

    function initToc() {
        var navSelector = '#toc';

        Toc.init({
            $nav: $(navSelector),
            $scope: $('main')
        });

        $('body').scrollspy({
            target: navSelector
        });
    }

    function initDocSearch() {
        const baseUrl = $('#hits').data('baseUrl');
        const searchInputSelector = 'nav.navbar input.search';
        const search = instantsearch({
            appId: '56WRZC44YH',
            apiKey: 'bbf78c03e114bf521934d93a10f82b62',
            indexName: 'sandstone_documentation',
            searchFunction: function (helper) {
                if (helper.state.query === '') {
                    document.querySelector('#hits').innerHTML = '';
                    return;
                }

                helper.search();
            }
        });

        search.addWidget(
            instantsearch.widgets.searchBox({
                container: '#search-box',
                placeholder: 'Search documentation',
                magnifier: false,
                reset: false,
                wrapInput: false,
                cssClasses: {
                    input: 'form-control search'
                }
            })
        );

        search.addWidget(
            instantsearch.widgets.hits({
                container: '#hits',
                cssClasses: {
                    root:  'list-group search-dropdown',
                    empty: 'list-group-item list-group-item-action'
                },
                templates: {
                    empty: '<p class="list-group-item-text">No results.</p>',
                    allItems: function (items) {
                        console.log(items);
                        let output = '';

                        items.hits.forEach(function (hit) {
                            output += '<div class="list-group-item list-group-item-action">';
                            output += '<a href="'+baseUrl+hit.url+'">';
                            output += '<h6 class="list-group-item-heading">'+hit._highlightResult.title.value+'</h6>';
                            output += '<p class="text-muted">'+hit._highlightResult.text.value+'</p>';
                            output += '</a></div>';
                        });

                        output += '<div class="list-group-item list-group-item-action">';
                        output += '<p class="text-muted text-right">Search powered by Algolia</p>';
                        output += '</div>';

                        return output;
                    }
                }
            })
        );

        search.start();
    }

    function transformBlockquotes() {
        $('blockquote').wrap('<div class="card mb-3">');
        $('blockquote').wrap('<div class="card-body">');
        $('blockquote').addClass('card-blockquote');

        $('blockquote').each(function () {
            if ($(this).data('level')) {
                $(this).closest('.card').addClass('border-'+$(this).data('level'));
            }
        });
    }
})(jQuery, Toc, instantsearch);
