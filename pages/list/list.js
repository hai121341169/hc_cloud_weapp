//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    select_index: -1,
    select_order_work_image_id: -1,
    hiddenModal: true,
    nocancel: true,
    promptText: ''
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
  saveImage: function(){

  },
  submitImage: function(){

  },
  bindconfirm: function(){
    this.setData({
      hiddenModal: true,
      promptText: ''
    })
  },
  onLoad: function (options) {
    var data = {};
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