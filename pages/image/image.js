//index.js
//获取应用实例
var app = getApp()
var userinfo, order_work_id
Page({
  data: {
    current_tab: 0,
    tab_0: [],
    tab_1: [],
    edit_hidden: false,
    edit_url: ''
  },
  tabChange: function(e){
    var index = e.currentTarget.dataset.index

    this.setData({
      current_tab: index
    })
  },
  addImage: function(){
    var _this = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showToast({
          title: '开始准备上传！',
          mask: true,
          icon: 'loading',
          duration: 60000
        })
        var fileLen = res.tempFilePaths.length;
        if(fileLen > 0){
          uploadPhoto(_this, res.tempFilePaths, 0)
        }
      },        
    });
  },
  onLoad: function (options) {
    // 初始化数据
    userinfo = wx.getStorageSync('userinfo');
    userinfo = JSON.parse(userinfo)
    order_work_id = options.order_work_id
    // console.log(order_work_id)
    this.setData({
      order_work_id: order_work_id
    })
  },
  onShow: function(){
    getList(this)
  }
})

function getList(that){
  wx.showToast({
    title: '加载中...',
    mask: true,
    icon: 'loading',
    duration: 60000
  });
  console.log(app.globalData.hucaiApi+'other/order/order_work_image')
  wx.request({  
    url: app.globalData.hucaiApi+'other/order/order_work_image',  
    data: {order_work_id: order_work_id},
    success: function (res) {
      var l_0 = [], l_1 = [] 

      var edit_hidden = res.data.data.status > 0 ? false : true

      // 判断是否为发起者
      var edit_url = res.data.data.user_id == userinfo.id ? '/pages/list/list' : '/pages/join/join'
      that.setData({
        edit_url: edit_url
      })
      for (var i = 0; i < res.data.data.list.length; i++) {
        var tmp_data = res.data.data.list[i]
        if(userinfo.id == tmp_data.user_id){
          l_0.push(tmp_data)
        }else{
          l_1.push(tmp_data)
        }  
      }

      // 参入者图片分组
      var map = {}, dest = []
      for(var i = 0; i < l_1.length; i++){
          var ai = l_1[i];
          if(!map[ai.user_id]){
              dest.push({
                  user_id: ai.user_id,
                  avatar_url: ai.avatar_url,
                  username: ai.username,
                  data: [ai]
              });
              map[ai.user_id] = ai;
          }else{
              for(var j = 0; j < dest.length; j++){
                  var dj = dest[j];
                  if(dj.user_id == ai.user_id){
                      dj.data.push(ai);
                      break;
                  }
              }
          }
      }
      that.setData({
        edit_hidden: edit_hidden,  
        tab_0: l_0,
        tab_1: dest
      });

      setTimeout(function() {
        wx.hideToast()
      }, 1000);
    }
  });  
}


function uploadPhoto(_this, tempFilePaths, i){
  wx.showToast({
    title: i+'/'+ tempFilePaths.length +'张上传成功',
    mask: true,
    icon: 'loading',
    duration: 60000
  });

  wx.uploadFile({
    url: app.globalData.hucaiApi+'other/image/add_image',
    filePath: tempFilePaths[i],
    name: 'file',
    formData:{
      order_work_id: order_work_id,
      user_id: userinfo.id
    },
    success: function(res){
      i++
      if(res.statusCode == 200){ // 上传成功的操作
        var data = JSON.parse(res.data)
        _this.data.tab_0.push(data.data)
        _this.setData({
          tab_0: _this.data.tab_0
        }) 
      }

      if(tempFilePaths.length == i){
        wx.showToast({
          title: i+'/'+ tempFilePaths.length +'张上传成功',
          mask: true,
          icon: 'loading',
          duration: 60000
        });
        setTimeout(function() {
          wx.hideToast()
        }, 1000);
      }else{
        uploadPhoto(_this, tempFilePaths, i)
      }
    },
    fail: function(res){
      // console.log(res)
      if(res.errMsg == "uploadFile:fail timeout"){
        wx.showToast({
          title: '上传超时',
          mask: true,
          icon: 'loading',
          duration: 60000
        });
        setTimeout(function() {
          wx.hideToast()
        }, 1000);
      }
    }
  })
}