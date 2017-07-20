//index.js
//获取应用实例
var app = getApp(),
userinfo, order_work_id, share, max_number, has_number, is_self, article_id
Page({
  data: {
    current_tab: 0,
    tab_0: [],
    tab_1: [],
    edit_hidden: false,
    add_hidden: false,
    edit_url: '',
    order_sn: '',
    work_id: ''
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
      count: ((max_number - has_number) > 9 ? 9 : (max_number - has_number)),
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
  onShareAppMessage: function (res) {
    return {
      title: '照片上传助手',
      path: '/pages/image/image?share='+encodeURIComponent(share),
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  onLoad: function (options) {
    // 初始化数据
    if(options.order_work_id){
      order_work_id = options.order_work_id
    }

    if(options.share){
      share = options.share
    }
    // console.log(order_work_id)
    this.setData({
      order_work_id: order_work_id
    })
  },
  onShow: function(){
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

  var data = { user_id: userinfo.id }
  if(order_work_id) data.order_work_id = order_work_id
  if(share) data.share = share
  // console.log(data)
  wx.request({  
    url: app.globalData.hucaiApi+'other/order/order_work_image',  
    data: data,
    success: function (res) {
      var l_0 = [], l_1 = []

      var edit_hidden = true, add_hidden = true
      if(res.data.data.status > 0){
        edit_hidden = add_hidden = false
      }

      // 判断是否为发起者
      has_number = res.data.data.list.length
      max_number = res.data.data.max_number
      var edit_url
      if(res.data.data.user_id == userinfo.id){
        edit_url = '/pages/list/list'
        is_self = true
        article_id = 1
      }else{
        edit_url = '/pages/join/join'
        is_self = false
        article_id = 2
      }
      that.setData({
        edit_url: edit_url,
        order_sn: res.data.data.order_sn,
        work_id: app.globalData.workText[res.data.data.work_id],
        max_number: max_number,
        has_number: has_number,
        article_id: article_id
      })

      // 判断是否满足最大上传数量
      if(max_number <= has_number) add_hidden = false
      if(has_number <= 0) edit_hidden = false

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
        add_hidden: add_hidden,  
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
      console.log(res)
      i++
      has_number++
      if(res.statusCode == 200){ // 上传成功的操作
        var data = JSON.parse(res.data)
        if(data.code != 200){
          setTimeout(function() {
            wx.hideToast()
          }, 1000);
          wx.showModal({
            content: data.description,
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                
              }
            }
          })
        }else{
          _this.data.tab_0.push(data.data)
          _this.setData({
            tab_0: _this.data.tab_0,
            has_number: has_number,
            edit_hidden: true
          }) 

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
        }

      }else{
        setTimeout(function() {
          wx.hideToast()
        }, 1000);
        wx.showModal({
          content: res.errMsg,
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              
            }
          }
        })
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