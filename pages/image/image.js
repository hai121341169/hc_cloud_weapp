//index.js
//获取应用实例
var app = getApp()
var userinfo, order_work_id
Page({
  data: {
    current_tab: 0,
    tab_0: [],
    tab_1: [],
    edit_hidden: false
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
        // _this.setData({
        //   hiddenLoadingModal: false
        // })
        wx.showToast({
          title: '开始准备上传！',
          icon: 'loading',
          duration: 60000
        })
        var fileLen = res.tempFilePaths.length;
        if(fileLen > 0){
          var i = 0,
          filepath = app.globalData.orderInfo.order_id + '/' + app.globalData.orderInfo.work_id
          uploadPhoto(_this, res.tempFilePaths, filepath, i)
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


function uploadPhoto(_this, tempFilePaths, filepath, i){
  wx.showToast({
    title: i+'/'+ tempFilePaths.length +'张上传成功',
    icon: 'loading',
    duration: 60000
  });
  // _this.setData({
  //   promptLoadingText: i+'/'+ tempFilePaths.length +'张上传成功'
  // })
  wx.uploadFile({
    url: app.globalData.cosApi+'weapp/upload', //仅为示例，非真实的接口地址
    filePath: tempFilePaths[i],
    name: 'file',
    formData:{
      'filename': _this.data.finish_num + '.' + tempFilePaths[i].split('.').pop(),
      'filepath': filepath
    },
    success: function(res){
      _this.data.finish_num++
      _this.data.success_up++

      if(res.statusCode == 200){
        _this.data.success_num++
        _this.data.images.push(tempFilePaths[i])
        _this.setData({
          images: _this.data.images
        }) 

        _this.data.success_images.push(JSON.parse(res.data).data)
        // console.log(_this.data.success_images)
      }

      i++

      if(tempFilePaths.length == i){
        // _this.setData({
        //   hiddenLoading: true
        // })
        wx.showToast({
          title: i+'/'+ tempFilePaths.length +'张上传成功',
          icon: 'loading',
          duration: 60000
        });
        // _this.setData({
        //   promptLoadingText: i+'/'+ tempFilePaths.length +'张上传成功'
        // })
        _this.data.success_up = 0
        setTimeout(function() {
          // _this.setData({
          //   hiddenLoadingModal: true
          // })
          wx.hideToast()
        }, 1000);
      }else{
        uploadPhoto(_this, tempFilePaths, filepath, i)
      }
    },
    fail: function(res){
      // console.log(res)
      if(res.errMsg == "uploadFile:fail timeout"){
        wx.hideToast()
        _this.setData({
          hiddenLoading: true,
          hiddenModal: false,
          promptText: '上传超时，请重新再试'
        })
      }
    }
  })