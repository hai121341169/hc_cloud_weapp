//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
  },
  //事件处理函数
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  formBindsubmit: function(e){
    // wx.showNavigationBarLoading()
    var _this = this
    if(e.detail.value.order_id == '' || !/^E\d{23}$/.test(e.detail.value.order_id)){
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
      _this.setData({
        hiddenLoading: false
      })
      // 验证订单是否
      wx.request({
        method: 'POST',
        url: app.globalData.hucaiApi+'index.php/openapi/b2c_orders/get_tc_order_status', //仅为示例，并非真实的接口地址
        data: {
           order_id: e.detail.value.order_id,
           bn: e.detail.value.work_id
        },
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        dataType: 'txt',
        success: function(res) {
          _this.setData({
            hiddenLoading: true
          })
          if(res.statusCode == '200'){
            var data = JSON.parse(res.data)
            if(data.error == 0){
              if(data.result.status == 0){
                app.globalData.orderInfo = {order_id: e.detail.value.order_id, work_id: e.detail.value.work_id}
                if(data.result.number > 0){
                  _this.setData({
                    nocancel: false,
                    hiddenModal: false,
                    promptText: '当前作品已上传图片，确定要重新上传？'
                  })
                }else{
                  wx.navigateTo({
                    url: '/pages/list/list'
                  })
                }
              }else if(data.result.status == 1){
                app.globalData.orderInfo = {}
                _this.setData({
                  hiddenModal: false,
                  promptText: '作品正在排版, 若有问题请直接联系客服。'
                })
              }else{
                app.globalData.orderInfo = {}
                _this.setData({
                  hiddenModal: false,
                  promptText: '作品排版完成, 若有问题请直接联系客服。'
                })
              }
            }else{
              app.globalData.orderInfo = {}
              _this.setData({
                hiddenModal: false,
                promptText: data.msg
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
    if(typeof(app.globalData.orderInfo) != "undefined" && app.globalData.orderInfo.order_id && app.globalData.orderInfo.order_id){
      wx.navigateTo({
        url: '/pages/list/list'
      })
    }
  },
  bindcancel: function(){
    var _this = this
    _this.setData({
      hiddenModal: true,
      promptText: '',
      nocancel: true
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '照片上传助手',
      path: '/pages/index/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
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
              order_id: res.data
            })
        }
      }
    })
  }
})
