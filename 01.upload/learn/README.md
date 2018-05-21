# Upload

图片上传组件主要功能： 预览、裁剪、压缩、上传


## multipart/form-data的请求方式
enctype=”multipart/form-data”：采用multipart格式上传文件，此时request头会显示 Content-Type:multipart/form-data; boundary=——WebKitFormBoundaryzr34cwJ67R95KQC9

## FormData类
通过键值对的方式来模拟一个完整的表单
最大的优点是用来上传二进制文件

```javascript
var form = new FormData()
// 添加img键值对
form.append('img', oInputFile.files[0])
// 获取img键值
form.getAll('img')
```

## FileReader类

允许web应用读取存储在用户计算机上的文件的内容。可以读取Blob或File对象。

```javascript
var reader = new FileReader()
reader.readAsDataURL(file)
reader.onload = function (e) {
    console.log(this.result) // 返回data:URL格式的字符串(base64编码) 不想普通的url一样只想网络上的资源，而本身就是数据
}
```

---

## File对象

File对象是特殊的Blob对象，继承了Blod的功能并将其扩展使其支持用户系统上的文件。

[js中关于Blob对象的介绍与使用](http://www.cnblogs.com/wangfajing/p/7202139.html)

[HTML 5 Blob对象](https://blog.csdn.net/zdy0_2004/article/details/52727250)
格式如下：

```javascript
{
  lastModified: 1526474903798
	lastModifiedDate: Wed May 16 2018 20:48:23 GMT+0800 (CST) {}
	name: "webpack.md"
	size: 0	  // 限定文件大小所用
	type: ""  // 限定文件类型所用
	webkitRelativePath: ""
}
```

获取方式一-传统表单：

```javascript
<form action="服务器地址" enctype="multipart/form-data" method="post">
    <input type="file" id="upload" multiple="multiple"
        accept="image/jpeg,image/png,image/gif"
    >
</form>

var fileInput = document.getElementById('upload')
fileInput.addEventListener('change', function (e) {
    var file = this.files || e.target.value // 得到FileList对象
    console.log(file)
})
```

...

[更多获取file对象请往这边](http://dwz.cn/3w6hSv)



图片预览之前，需要读取file对象，有两种方式，一种是使用window.URL,另一种是使用FileReader
window.URL: 性能更好
FileReader: base64,体积增大，在一些手机丢失文件格式参数，base64在结合canvas实现裁剪的时候用得比较多

## 上传方式

* 普通表单上传
* Ajax无刷新上传
* flash上传：满足上传进度、中断上传、分段上传
* 粘贴上传
* 拖拽上传

* [图片上传的多种方式](http://dwz.cn/3w6hSv)
* [图片上传组件思路篇](https://segmentfault.com/a/1190000013038300)
* [移动端图片上传的坑](https://github.com/CommanderXL/imgResize)
* [前端裁剪上传图片](http://www.renfed.com/2017/01/30/crop/)



