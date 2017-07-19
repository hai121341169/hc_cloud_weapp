//join.js
//获取应用实例
var app = getApp()
var userinfo
Page({
  data: {
    select_index: -1,
    select_order_work_image_id: -1,
    hiddenModal: true,
    nocancel: true,
    promptText: ''
  },
  removeImage: function(e){
    var _this = this
    var index = e.currentTarget.dataset.index
    var order_work_image_id = e.currentTarget.dataset.order_work_image_id
    
    _this.data.list.splice(index, 1);
    _this.setData({
      list: _this.data.list
    })

    wx.request({  
      url: app.globalData.hucaiApi+'other/order/remove_order_work_image',  
      data: { order_work_image_id: order_work_image_id },
      success: function (res) {
        if(res.statusCode == 200){
          if(res.data.code == 200){
          }else{
            _this.setData({
              hiddenModal: false,
              promptText: res.data.description
            })
          }
        }else{
          _this.setData({
            hiddenModal: false,
            promptText: '删除失败'
          })
        }
      }
    });      
  },
  submitImage: function(){
    wx.navigateBack({
        delta: 1
    })
  },
  bindconfirm: function(){
    this.setData({
      hiddenModal: true,
      promptText: ''
    })
  },
  onLoad: function (options) {
    var data = {};
    userinfo = wx.getStorageSync('userinfo');
    userinfo = JSON.parse(userinfo)
    if(!options.order_work_id){
      if(!options.order_id || !options.work_id){
        console.log('缺少参数')
        return;
      }else{
        data.order_id = options.order_id
        data.work_id = options.work_id
      }
    }else{
      data.order_work_id = options.order_work_id
    }

    getList(this, data)
  }
})


function getList(that, data){
  wx.showToast({
    title: '加载中...',
    mask: true,
    icon: 'loading',
    duration: 60000
  });

  wx.request({  
    url: app.globalData.hucaiApi+'other/order/order_work_image',  
    data: data,
    success: function (res) {
      if(res.data.data.status > 0){
        console.log('订单已经提交，不允许再编辑')
        return
      }
      var list = res.data.data.list, list_data = []
      // console.log(list)
      // 根据状态进行分组
      for(var i = 0; i < list.length; i++){
        if(list[i].user_id == userinfo.id){
          list_data.push(list[i])
        }
      }

      
      that.setData({
        list: list_data
      })

      setTimeout(function() {
        wx.hideToast()
      }, 1000);
    }
  });  
}