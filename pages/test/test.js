Page({  
  data: {  
    list: []  
  },  
  onLoad: function (options) {  
    // 页面初始化 options为页面跳转所带来的参数  
    var that = this  
    GetList(that)  
  },  
  onPullDownRefresh: function () {  
    //下拉  
    console.log("下拉");  
    p = 1;  
    this.setData({  
      list: [],  
    });  
    var that = this  
    GetList(that)  
  },  
  onReachBottom: function () {  
    //上拉  
    console.log("上拉")  
    var that = this  
    GetList(that)  
  }  
})  

var p = 1  
var url = "http://basic.wh.com/other/image/test";  
var GetList = function (that) {  
  that.setData({  
    hidden: false  
  });  
  wx.request({  
    url: url,  
    data: {  
      pageSize: 10,  
      pageNo: p  
    },  
    success: function (res) {
      var l = that.data.list 
        console.log(l); console.log(res.data.data);
      for (var i = 0; i < res.data.data.length; i++) {  
        l.push(res.data.data[i])  
      }  
      that.setData({  
        list: l  
      });  
      p++;  
      that.setData({  
        hidden: true  
      });  
    }  
  });  
}  