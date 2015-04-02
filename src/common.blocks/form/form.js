modules.define('form', ['i-bem__dom', 'jquery'], function (provide, BEMDOM, $) {
    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function () {
                    this.findBlockInside('button').bindTo('click', this.performAction.bind(this));
                }
            }
        },

        performAction: function (event) {
            /* jshint ignore:start */
            if (!confirm(this.params.message)) {
                // $(this.domElem).submit();
                event.preventDefault();
            }
            /* jshint ignore:end */
        }
    }));
});
