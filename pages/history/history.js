//index.js
//获取应用实例
var app = getApp()
var userinfo
Page({
  data: {
    current_tab: 0,
    hidden_tip: true,
    tip_content: '下拉加载',
    tab_0: {
      p: 1,
      list: []
    },
    tab_1: {
      p: 1,
      list: []
    }
  },
  tabChange: function(e){
    var index = e.currentTarget.dataset.index

    this.setData({
      current_tab: index,
      hidden_tip: false
    })

    getList(this);
  },
  deleteOrderWork: function(e){
    var _this = this
    var index = e.currentTarget.dataset.index
    var order_work_id = e.currentTarget.dataset.order_work_id
    if(order_work_id > 0 && index >= 0){
      wx.request({  
        url: app.globalData.hucaiApi+'other/order/remove_order_work',  
        data: { order_work_id: order_work_id },
        success: function (res) {
          console.log(res)
          if(res.statusCode == 200){
            if(res.data.code == 200){
              var l = _this.data.tab_0.list
              l.splice(index, 1);
              _this.setData({  
                list: l
              })
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
    }
  },
  editOrderWork: function(e){
    var order_work_id = e.currentTarget.dataset.order_work_id
    if(order_work_id > 0){
      wx.navigateTo({
        url: '/pages/image/image?order_work_id='+order_work_id
      })
    }
  },
  onLoad: function () {
    userinfo = wx.getStorageSync('userinfo');
    userinfo = JSON.parse(userinfo)

    getList(this)
  }, 
  onReachBottom: function () {
    getList(this) 
  }  
})

function getList(that){
  var obj, url
  if(that.data.current_tab == 0){
    obj = that.data.tab_0;
    url = app.globalData.hucaiApi+'other/order/order_work'
  }else if(that.data.current_tab == 1){
    obj = that.data.tab_1;
    url = app.globalData.hucaiApi+'other/order/join_order_work'
  }

  wx.showToast({
    title: '加载中...',
    mask: true,
    icon: 'loading',
    duration: 60000
  });

  that.setData({
    hidden_tip: false
  });

  wx.request({  
    url: url,  
    data: { 
      user_id: userinfo.id,
      page: obj.p  
    },  
    success: function (res) {
      var l = obj.list 
      for (var i = 0; i < res.data.data.length; i++) { 
        var tmp_data = res.data.data[i]
        tmp_data['work_id'] = app.globalData.workText[tmp_data['work_id']] 
        tmp_data['is_self'] = tmp_data['user_id'] == userinfo.id ? true: false
        tmp_data['is_image'] = that.data.current_tab == 0 ? false: true

        if(tmp_data['status'] == 0){
          tmp_data['btn0_bindtap'] = 'deleteOrderWork'
          tmp_data['btn0_text'] = '删除'
          tmp_data['btn0_bg'] = ''
        }else{
          tmp_data['btn0_bindtap'] = ''
          tmp_data['btn0_text'] = '删除'
          tmp_data['btn0_bg'] = 'hidden'
        }

        if(tmp_data['status'] == 0){
          tmp_data['btn1_bindtap'] = 'editOrderWork'
          tmp_data['btn1_text'] = tmp_data['is_self'] ? '继续处理' : '继续参入'
          tmp_data['btn1_bg'] = 'red'
        }else if(tmp_data['status'] == 1){
          tmp_data['btn1_bindtap'] = ''
          tmp_data['btn1_text'] = '等待接单'
          tmp_data['btn1_bg'] = 'grap'
        }else if(tmp_data['status'] == 2){
          tmp_data['btn1_bindtap'] = ''
          tmp_data['btn1_text'] = '已接单'
          tmp_data['btn1_bg'] = 'grap'
        }else if(tmp_data['status'] == 3){
          tmp_data['btn1_bindtap'] = ''
          tmp_data['btn1_text'] = '处理结束'
          tmp_data['btn1_bg'] = 'grap'
        }
        l.push(tmp_data)  
      }  
      that.setData({  
        list: l
      });
      obj.p++
      setTimeout(function() {
        that.setData({
          hidden_tip: true
        });
        wx.hideToast()
      }, 1000);
    }  
  });  
}
