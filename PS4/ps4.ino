#include <PS4Controller.h>  // PS4 controller library

void setup() {
  Serial.begin(9600);
  PS4.begin();
  Serial.println("PS4 controller connected");

  // Motor pins
  pinMode(15, OUTPUT); // Motor 1 speed
  pinMode(2, OUTPUT);  // Motor 1 direction
  pinMode(5, OUTPUT);  // Motor 2 speed
  pinMode(18, OUTPUT); // Motor 2 direction
  pinMode(19, OUTPUT); // Motor 3 speed
  pinMode(21, OUTPUT); // Motor 3 direction
  pinMode(22, OUTPUT); // Motor 4 speed
  pinMode(23, OUTPUT); // Motor 4 direction
}

void loop()
{
  if (PS4.isConnected()) {
    int x = PS4.LStickX(); // Left joystick X-axis
    int y = PS4.LStickY(); // Left joystick Y-axis
   Serial.print("Joystick X: ");
   Serial.print(x);
   Serial.print("\tJoystick Y: ");
   Serial.println(y);
    if(abs(x)>10 || abs(y)>10){
      // Calculate motor speeds using velocity equation
      float motorSpeed1 = 0.3536*(x-y);
      float motorSpeed2 = 0.3536*(x+y);
      float motorSpeed3 = 0.3536*(-x+y);
      float motorSpeed4 = 0.3536*(-x-y); 

      // Convert motor speeds to the 0-255 range 
      int speed1 = convertSpeed(motorSpeed1);
      int speed2 = convertSpeed(motorSpeed2);
      int speed3 = convertSpeed(motorSpeed3);
      int speed4 = convertSpeed(motorSpeed4);

      // Set motor 1 direction and speed
      digitalWrite(2, motorSpeed1 >= 0 ? HIGH : LOW);
      analogWrite(15, abs(speed1));
      
      // Set motor 2 direction and speed
      digitalWrite(18, motorSpeed2 >= 0 ? HIGH : LOW);
      analogWrite(5, abs(speed2));
      
      // Set motor 3 direction and speed
      digitalWrite(21, motorSpeed3 >= 0 ? HIGH : LOW);
      analogWrite(19, abs(speed3));
      
      // Set motor 4 direction and speed
      digitalWrite(23, motorSpeed4 >= 0 ? HIGH : LOW);
      analogWrite(22, abs(speed4));
 
    }
    else
    { if(abs(x)<10 || abs(y)<10){
        analogWrite(15, 0);
        analogWrite(5, 0);
        analogWrite(19, 0);
        analogWrite(22, 0);
        }
      int ps4r2=PS4.R2Value();
       if (ps4r2>10) {
        setMotor(2, 15, HIGH,ps4r2);
        setMotor(18, 5, HIGH,ps4r2);
        setMotor(21, 19, HIGH,ps4r2);
        setMotor(23, 22, HIGH,ps4r2);
        }
        
      int ps4l2=PS4.L2Value();
       if (ps4l2>10) {
        setMotor(2, 15, LOW,ps4l2);
        setMotor(18, 5, LOW,ps4l2);
        setMotor(21, 19, LOW,ps4l2);
        setMotor(23, 22, LOW,ps4l2);
        }
      if (PS4.Right()) {
        setMotor(2, 15, HIGH, 100);
        setMotor(23, 22, LOW, 100);
        setMotor(21, 19, LOW, 100);
        setMotor(18, 5, HIGH, 100);
         }
      if (PS4.Up()) {
        setMotor(2, 15, LOW, 100);
        setMotor(23, 22, LOW, 100);
        setMotor(21, 19, HIGH, 100);
        setMotor(18, 5, HIGH, 100);
        }
      if (PS4.Down()) {
        setMotor(2, 15, HIGH, 100);
        setMotor(23, 22, HIGH, 100);
        setMotor(21, 19, LOW, 100);
        setMotor(18, 5, LOW, 100);
        }
      if (PS4.Left()) {
        setMotor(2, 15, LOW, 100);
        setMotor(23, 22, HIGH, 100);
        setMotor(21, 19, HIGH, 100);
        setMotor(18, 5, LOW, 100);
        }
      if (PS4.Cross()) {
        // Stop all motors
        analogWrite(15, 0);
        analogWrite(5, 0);
        analogWrite(19, 0);
        analogWrite(22, 0);
        }
      if (PS4.Circle()) {
        setMotor(2, 15, HIGH, 100);
        setMotor(18, 5, HIGH, 100);
        setMotor(21, 19, HIGH, 100);
        setMotor(23, 22, HIGH, 100);
        }
     }

  }
}

int convertSpeed(float speed) {
  // Map speed to range 0-255
  return (int)(abs(speed) *2.5 ); //4.017 //max value of speed is 63.5 , so return=speed/63.5*255
}
void setMotor(int dirPin, int speedPin, int direction, int speed) {
  digitalWrite(dirPin, direction);
  analogWrite(speedPin, speed);
}
