chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    console.log(details);
    const xhr = new XMLHttpRequest();
    xhr.open(details.method, details.url, false);
    if ("POST" === details.method) {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      var params = "";
      for (var name in details.requestBody.formData) {
        params += name + "=" + details.requestBody.formData[name] + "&"
      }
      xhr.send(params);
    } else {
      xhr.send();
    }
    const result = JSON.parse(xhr.responseText);
    console.log(result);
    if (0 !== result.errno) {
      return {cancel: false};
    }

    console.log(result.list);
    var url = "";
    if (result.dlink) {
      if (result.dlink instanceof Array) {
        url = result.dlink[0].dlink;
      } else {
        url = result.dlink;
      }
    } else if (result.list) {
      url = result.list[0].dlink;
    }

    chrome.tabs.create({
      'url': chrome.extension.getURL("url.html"),
      'active': true
    }, function (tab) {
      var selfTabId = tab.id;
      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status == "complete" && tabId == selfTabId) {
          var tabs = chrome.extension.getViews({type: "tab"});
          tabs[0].setURL(url);
        }
      });
    });

    return {cancel: true};
  },
  {urls: ["*://*.baidu.com/api/*download?*"]},
  ["blocking", "requestBody"]
);