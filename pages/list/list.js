//index.js
//获取应用实例
var app = getApp(),
order_work_id,
userinfo
Page({
  data: {
    select_index: -1,
    select_order_work_image_id: -1,
  },
  selectImage: function(e){
    var index = e.currentTarget.dataset.index

    this.setData({
      select_index: index,
      select_order_work_image_id: e.currentTarget.dataset.order_work_image_id
    })
  },
  insertImage: function(e){
    var select_index = this.data.select_index
    var index = e.currentTarget.dataset.index
    var order_work_image_id = 0
    var order_work_image_status = -1

    // 判断是插入还是放到临时区
    if(select_index >= 0){
      if(index >= 0){
        this.data.list_1.splice(index, 0, this.data.list_0[select_index]);
        this.data.list_0.splice(select_index, 1);
      }else{
        if(!this.data.list_1) this.data.list_1 = []
        this.data.list_1.push(this.data.list_0[select_index]);
        this.data.list_0.splice(select_index, 1);
      }
      order_work_image_id = this.data.select_order_work_image_id
      order_work_image_status = 1
      this.setData({
          list_0: this.data.list_0,
          list_1: this.data.list_1,
          select_index: -1,
          select_order_work_image_id: -1
      })
    }else{
      if(index >= 0){
        if(!this.data.list_0) this.data.list_0 = []
        this.data.list_0.push(this.data.list_1[index]);
        this.data.list_1.splice(index, 1);
        this.setData({
            list_0: this.data.list_0,
            list_1: this.data.list_1
        })
        order_work_image_id = e.currentTarget.dataset.order_work_image_id
        order_work_image_status = 0
      }
    }

    if(order_work_image_id > 0 && order_work_image_status >= 0){
      var _this = this
      wx.request({  
        url: app.globalData.hucaiApi+'other/order/update_order_work_image',  
        data: { order_work_image_id: order_work_image_id, status: order_work_image_status },
        success: function (res) {
          if(res.statusCode == 200){
            if(res.data.code != 200){
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
    }
  },
  removeImage: function(e){
    var _this = this
    var index = e.currentTarget.dataset.index
    var order_work_image_id = e.currentTarget.dataset.order_work_image_id

    _this.data.list_0.splice(index, 1);
    _this.setData({
      list_0: _this.data.list_0
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
  saveImage: function(save){
    var sort = [],
        save = typeof(arguments[0]) == 'number' ? arguments[0] : 0,
        list = this.data.list_1 || [],
        list_0 = this.data.list_0 || []
    list = list.concat(list_0)
    wx.showToast({
      title: '加载中...',
      mask: true,
      icon: 'loading',
      duration: 60000
    });
    if(list){
      for(var i in list){
        sort.push(list[i].id)
      }
      console.log({ order_work_id: order_work_id, sort: sort })
      // 排序写入数据库
      wx.request({
        method: 'POST',
        url: app.globalData.hucaiApi+'other/order/save_order_work_image',  
        data: { order_work_id: order_work_id, sort: sort, save: save },
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.hideToast()
          if(res.statusCode == 200){
            if(res.data.code == 200){
              var content = '保存成功，您下次可以在"历史照片查询"中继续处理。'
              if(save == 1) content = '照片提交成功！您可在"历史照片查询"页面中查询进度。'

              wx.showModal({
                content: content,
                showCancel: false,
                success: function(res) {
                  if (res.confirm) {
                    wx.navigateBack({
                        delta: 2
                    })
                  }
                }
              })
            }else{
              wx.showModal({
                content: res.data.description,
                showCancel: false,
                success: function(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  }
                }
              })
            }
          }else{
            wx.showModal({
              content: '保存失败',
              showCancel: false,
              success: function(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            })
          }
        }
      });
    }
  },
  submitImage: function(){
    var _this = this
    if(this.data.list_0){
      console.log(this.data.list_0.length)
      if(this.data.list_0.length > 0){
        wx.showModal({
          showCancel: false,
          content: '临时区还有未处理的照片，请处理完后再提交。',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        return
      }
    }
    wx.showModal({
      content: '正式提交后将不可再对照片进行编辑，确认提交？',
      success: function(res) {
        if (res.confirm) {
          _this.saveImage(1)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    this.setData({
      hiddenModal: false,
      promptText: ''
    })
  },
  qualityListen: function(e){
    var quality = e.currentTarget.dataset.quality
    var quality_warn = ['', '照片不符合要求，建议上传4:3比例的照片', '照片像素过低，可能导致照片模糊！建议更换为短边尺寸大于900像素的照片']
    console.log(quality)
    wx.showModal({
      showCancel: false,
      content: quality_warn[quality],
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        }
      }
    })
  },
  onLoad: function (options) {
    var data = {};
    userinfo = app.globalData.userinfo
    if(JSON.stringify(userinfo) == "{}"){
      wx.showModal({
        content: '暂时还未登陆',
        showCancel: false,
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/index/index'
            })
          }
        }
      })
    }

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
      order_work_id = data.order_work_id
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
      var list = res.data.data.list
      // 根据状态进行分组
      var map = {}, dest = []
      for(var i = 0; i < list.length; i++){
          var ai = list[i];
          if(!map[ai.status]){
              dest.push({
                  status: ai.status,
                  data: [ai]
              });
              map[ai.status] = ai;
          }else{
              for(var j = 0; j < dest.length; j++){
                  var dj = dest[j];
                  if(dj.status == ai.status){
                      dj.data.push(ai);
                      break;
                  }
              }
          }
      }

      var list_data = {}
      for(var i in dest){
        list_data[dest[i].status] = dest[i].data
      }
      
      that.setData({
        list_0: list_data[0],
        list_1: list_data[1]
      })

      setTimeout(function() {
        wx.hideToast()
      }, 1000);
    }
  });  
}