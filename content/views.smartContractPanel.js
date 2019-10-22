var SmartContractPanelView = Backbone.View.extend({
    tagName: "div",

    events: {
        "click .btn-build-contract": "onClickBuild",
        "click .btn-deploy-contract": "onClickDeploy",
        "click .btn-run-contract": "onClickRun",
    },

    initialize: function () {
        this.listenTo(this.model, "change", this.onModelChange);
    },

    onModelChange: function () {
        this.render();
    },

    render: function () {
        var template = app.underscoreTemplates["TemplateSmartContractPanel"];
        var contract = this.model.toJSON();
        var html = template({ contract: contract });
        this.$el.html(html);
        this.renderVMOutput();

        return this;
    },

    renderVMOutput: function () {
        if (this.vmOutputView) {
            this.vmOutputView.remove();
        }

        this.vmOutputView = new VMOutputView({
            el: this.$el.find(".vm-output-view"),
            model: this.model.get("LatestRun")
        });

        this.vmOutputView.render();
    },

    onClickBuild: function () {
        this.model.build();
    },

    onClickDeploy: function () {
        var deployDialog = new DeployDialog({
            model: this.model
        });

        deployDialog.show();
    },

    onClickRun: function () {
        var runDialog = new RunDialog({
            model: this.model
        });

        runDialog.show();
    }
});

var VMOutputView = Backbone.View.extend({
    tagName: "div",

    initialize: function () {
        this.render();
    },

    render: function () {
        var template = app.underscoreTemplates["TemplateVMOutput"];
        var html = template({ data: this.model.VMOutput || {} });
        this.$el.html(html);
        return this;
    },
});