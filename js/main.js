(function ($, Toc) {
    $(function () {
        initToc();
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
})(jQuery, Toc);
