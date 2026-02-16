class Camera {
    constructor(canvas) {
        this.fov = 60;
        this.speed = 1;
        this.alpha = 1;
        this.eye = new Vector3([0,0,0]);
        this.at =  new Vector3([0,0,-1]);
        this.up =  new Vector3([0,1,0]);

        this.projM = new Matrix4();
        this.projM.setPerspective(60, canvas.width / canvas.height, 0.1, 1000);
        
        this.viewM = new Matrix4();
        this.viewM.setLookAt(
            this.eye.x, this.eye.y, this.eye.z,
            this.at.x, this.at.y, this.at.z,
            this.up.x, this.up.y, this.up.z,
        );
    }

    forward() {
        var f = this.at.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.at.add(f);
        this.eye.add(f);
    }

    back() {
        var f = this.eye.sub(this.at);
        f.normalize();
        f.mul(this.speed);
        this.at.add(f);
        this.eye.add(f);
    }

    left() {
        var f = this.at.sub(this.eye);
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }

    right() {
        var f = this.at.sub(this.eye);
        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }

    panLeft() {
        var f = this.at.sub(this.eye);
        var rm = new Matrix4().setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rm.multiplyVector3(f);
        this.at = this.eye.add(f_prime);
    }

    panRight() {
        var f = this.at.sub(this.eye);
        var rm = new Matrix4().setRotate(-(this.alpha), this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rm.multiplyVector3(f);
        this.at = this.eye.add(f_prime);
    }
}