export default class Article {
  constructor({ index, title, titleUrl, summary, description, imageUrl, categories, author, rawDatetime, datetime }) {
    this.index = index;
    this.title = title;
    this.titleUrl = titleUrl;
    this.summary = summary;
    this.description = description;
    this.imageUrl = imageUrl;
    this.categories = categories;
    this.author = author;
    this.rawDatetime = rawDatetime;
    this.datetime = datetime;
  }
}