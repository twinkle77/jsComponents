图片懒加载：

单张大背景的懒加载、全站图片的懒加载



原理：先加载小图，等大图加载完后，替换图片的src或者直接appendChild一个img覆盖上去。



小图的来源：可以每张大图对应一张小图（由工具生成），也可以全站只有一张小图如.git之类的图片。



小图结合高斯模糊flur或canvas模糊图片是过渡效果更好





参考文章:

* [实现类似Pinterest 的图片预加载功能](http://www.jackpu.com/shi-xian-lei-si-pinterest-de-tu-pian-yu-jia-zai-gong-neng/)
* [Medium 是如何优化图片加载的](http://www.jackpu.com/medium-shi-ru-he-zuo-tu-pian-jia-zai-de/)
* [facebook图片预加载方案](https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/)
* [Intrinsic Placeholders with the Picture Element](http://daverupert.com/2015/12/intrinsic-placeholders-with-picture/)
* [渐进式背景图片渲染-svg实现](https://css-tricks.com/the-blur-up-technique-for-loading-background-images/)
* [渐进式背景图片渲染](Progressive Background-Image With Ease)





实例:

[1](https://codepen.io/jmperez/pen/yYjPER)

[2](http://events.jackpu.com/medium-like-image-loading/)

[渐进式多图加载-canvas](https://robin-front.github.io/code-code-hut/progressive.js/demo/index.html)

[渐进式背景图片加载-canvas](https://robin-front.github.io/code-code-hut/progressive.js/demo/index.background.html)