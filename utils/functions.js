const shuffle = array => {
  let currentIndex = array.length,
    result = [],
    temporaryValue,
    randomIndex;
  while (currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  array.slice(0, 6).map(item => {
    result.push({
      itemId: item.id.playlistId,
      title: item.snippet.title,
      description: item.snippet.description || null,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle
    });
  });

  return result;
};

module.exports = shuffle;
