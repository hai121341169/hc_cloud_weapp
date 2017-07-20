function getGlobalUserInfo(userinfo){
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
    return userinfo
  }
}

module.exports = {
  getGlobalUserInfo: getGlobalUserInfo
}