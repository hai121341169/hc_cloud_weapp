//index.js
//获取应用实例
var app = getApp()
var userinfo = app.globalData.userinfo
Page({
  data: {
    index: 0,
    nocancel: true,
    hiddenModal: true,
    promptText: ''
  },
  //事件处理函数
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  formBindsubmit: function(e){
    var _this = this
    if(e.detail.value.order_sn == ''){
      _this.setData({
        hiddenModal: false,
        promptText: '订单号不正确'
      })
    }else if(!/^E\d{23}$/.test(e.detail.value.order_sn) && e.detail.value.order_sn != '88888888'){
      _this.setData({
        hiddenModal: false,
        promptText: '订单号不正确'
      })
      console.info('');
    }else if(e.detail.value.work_id == ''){
      _this.setData({
        hiddenModal: false,
        promptText: '作品不能为空'
      })
    }else{
      wx.showToast({
        title: '提交中，请稍后',
        mask: true,
        icon: 'loading',
        duration: 60000
      });
      // 验证订单是否
      var userinfo = app.globalData.userinfo
      if(JSON.stringify(userinfo) == "{}"){
        wx.hideToast();
        
        wx.showModal({
          content: '暂时还未登陆',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              
            }
          }
        })
        return
      }
      wx.request({
        method: 'POST',
        url: app.globalData.hucaiApi+'other/order', //仅为示例，并非真实的接口地址
        data: {
           order_sn: e.detail.value.order_sn,
           work_id: e.detail.value.work_id,
           user_id: userinfo.id
        },
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        dataType: 'txt',
        success: function(res) {
          wx.hideToast()
          if(res.statusCode == '200'){
            var data = JSON.parse(res.data)
            if(data.code == 200){
              wx.navigateTo({
                url: '/pages/image/image?order_work_id='+data.data.id
              })
            }else{
              app.globalData.orderInfo = {}
              _this.setData({
                hiddenModal: false,
                promptText: data.description
              })
            }
          }else{
            app.globalData.orderInfo = {}
            _this.setData({
              hiddenModal: false,
              promptText: '暂无响应'
            })
          }
        }
      })
    }
  },
  bindconfirm: function(){
    var _this = this
    _this.setData({
      hiddenModal: true,
      promptText: '',
      nocancel: true
    })
  },
  bindcancel: function(){
    var _this = this
    _this.setData({
      hiddenModal: true,
      promptText: '',
      nocancel: true
    })
  },
  onLoad: function () {
    var _this = this
    _this.setData({
      array: app.globalData.workText
    })
  },
  onShow: function(){
    var _this = this
    wx.getClipboardData({
      success: function(res){
        if(res.errMsg == "getClipboardData:ok"){
          if(/^E\d{23}$/.test(res.data))
            _this.setData({
              order_sn: res.data
            })
        }
      }
    })
  }
})
