var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "postcss", "fs-extra", "prettier"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var postcss_1 = __importDefault(require("postcss"));
    var fs_extra_1 = __importDefault(require("fs-extra"));
    var prettier_1 = __importDefault(require("prettier"));
    var css = fs_extra_1.default.readFileSync("./index.qixiancss");
    var tempMap = {};
    var fitMap = {
        fill: function (url) { return [
            postcss_1.default.decl({
                prop: "background-size",
                value: "100% 100%"
            }),
            postcss_1.default.decl({
                prop: "background-image",
                value: url
            })
        ]; },
        contain: function (url) { return [
            postcss_1.default.decl({
                prop: "background-size",
                value: "contain"
            }),
            postcss_1.default.decl({
                prop: "background-image",
                value: url
            })
        ]; },
        cover: function (url) { return [
            postcss_1.default.decl({
                prop: "background-size",
                value: "cover"
            }),
            postcss_1.default.decl({
                prop: "background-image",
                value: url
            })
        ]; },
        fitHeight: function (url) { return [
            postcss_1.default.decl({
                prop: "background-size",
                value: "auto 100%"
            }),
            postcss_1.default.decl({
                prop: "background-image",
                value: url
            })
        ]; },
        fitWidth: function (url) { return [
            postcss_1.default.decl({
                prop: "background-size",
                value: "100% auto"
            }),
            postcss_1.default.decl({
                prop: "background-image",
                value: url
            })
        ]; }
    };
    postcss_1.default()
        .process(css, {
        from: "./index.qixiancss"
    })
        .then(function (_a) {
        var root = _a.root;
        root.walkComments(function (comments) {
            comments.remove();
        });
        root.walkRules(function (rule) {
            // 保存模板
            if (rule.selector && rule.selector.indexOf("temp") > -1) {
                var tempName = rule.selector.split("-").pop();
                tempMap[tempName] = rule.nodes.slice();
                rule.remove();
                return;
            }
            // 如果是fit属性
            rule.walkDecls(function (decl) {
                if (decl.prop === "fit") {
                    var value = decl.value;
                    var url = value.split(" ")[0];
                    var fitProps = value.split(" ").pop();
                    var newDecls = fitMap[fitProps](url);
                    if (newDecls) {
                        decl.replaceWith(newDecls);
                    }
                    return;
                }
                // 如果是模板属性
                if (decl.prop === "temp") {
                    var value = decl.value;
                    var decls = tempMap[value];
                    var newDecls = decls.map(function (decl) { return decl.clone(); });
                    if (decls) {
                        decl.replaceWith(newDecls);
                    }
                }
            });
        });
        var code = root.toString();
        fs_extra_1.default.writeFileSync("./dist/index.css", prettier_1.default.format(code, {
            parser: "css"
        }));
    });
});
//# sourceMappingURL=index.js.map