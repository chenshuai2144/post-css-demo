import postcss, { Declaration } from "postcss";
import fs from "fs-extra";
import prettier from "prettier";

const css = fs.readFileSync("./index.qixiancss");

const tempMap = {};

const fitMap = {
  fill: url => [
    postcss.decl({
      prop: "background-size",
      value: "100% 100%"
    }),
    postcss.decl({
      prop: "background-image",
      value: url
    })
  ],
  contain: url => [
    postcss.decl({
      prop: "background-size",
      value: "contain"
    }),
    postcss.decl({
      prop: "background-image",
      value: url
    })
  ],
  cover: url => [
    postcss.decl({
      prop: "background-size",
      value: "cover"
    }),
    postcss.decl({
      prop: "background-image",
      value: url
    })
  ],
  fitHeight: url => [
    postcss.decl({
      prop: "background-size",
      value: "auto 100%"
    }),
    postcss.decl({
      prop: "background-image",
      value: url
    })
  ],
  fitWidth: url => [
    postcss.decl({
      prop: "background-size",
      value: "100% auto"
    }),
    postcss.decl({
      prop: "background-image",
      value: url
    })
  ]
};

postcss()
  .process(css, {
    from: "./index.qixiancss"
  })
  .then(({ root }) => {
    // 删除所有的注释
    root.walkComments(comments => {
      comments.remove();
    });
    root.walkRules(rule => {
      // 保存模板
      if (rule.selector && rule.selector.indexOf("temp") > -1) {
        const tempName = rule.selector.split("-").pop();
        tempMap[tempName] = [...rule.nodes];
        rule.remove();
        return;
      }
      // 如果是fit属性
      rule.walkDecls(decl => {
        if (decl.prop === "fit") {
          const value = decl.value;
          const url = value.split(" ")[0];
          const fitProps = value.split(" ").pop();
          const newDecls = fitMap[fitProps](url) as Declaration[];
          if (newDecls) {
            decl.replaceWith(newDecls);
          }
          return;
        }
        // 如果是模板属性
        if (decl.prop === "temp") {
          const value = decl.value;
          const decls = tempMap[value] as Declaration[];
          const newDecls = decls.map(decl => decl.clone());
          if (decls) {
            decl.replaceWith(newDecls);
          }
        }
      });
    });
    const code = root.toString();
    fs.writeFileSync(
      "./dist/index.css",
      prettier.format(code, {
        parser: "css"
      })
    );
  });
