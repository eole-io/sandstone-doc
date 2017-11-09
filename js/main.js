(function ($, Toc) {
    $(function () {
        var navSelector = '#toc';

        Toc.init({
            $nav: $(navSelector),
            $scope: $('main')
        });

        $('body').scrollspy({
            target: navSelector
        });
    });
})(jQuery, Toc);
