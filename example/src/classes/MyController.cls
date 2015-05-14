public with sharing class MyController {
  public String myMessage { get; set; }
  public MyController() {
    this.myMessage = 'Deployed using gulp!!';
  }
}