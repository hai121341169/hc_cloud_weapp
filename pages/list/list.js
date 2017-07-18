//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    select_index: -1,
    select_order_work_image_id: -1
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
    console.log(index)
    console.log(select_index)
    console.log(this.data.list_1)
    console.log(this.data.list_0)

    // 判断是插入还是放到临时区
    if(select_index >= 0){
      if(index >= 0){
        this.data.list_1.splice(index, 0, this.data.list_0[select_index]);
        this.data.list_0.splice(select_index, 1);
        this.setData({
            list_0: this.data.list_0,
            list_1: this.data.list_1,
            select_index: -1,
            select_order_work_image_id: -1
        })
      }else{
        this.data.list_1.push(this.data.list_0[select_index]);
        this.data.list_0.splice(select_index, 1);
        this.setData({
            list_0: this.data.list_0,
            list_1: this.data.list_1
        })
      }
    }else{
      this.data.list_0.push(this.data.list_1[index]);
      this.data.list_1.splice(index, 1);
      this.setData({
          list_0: this.data.list_0,
          list_1: this.data.list_1
      })
    }
  },
  saveImage: function(){

  },
  submitImage: function(){

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
  console.log(app.globalData.hucaiApi+'other/order/order_work_image')
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