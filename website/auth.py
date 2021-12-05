from flask import Blueprint, render_template, request, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

from website.sendEmail import sendEmail
from . import db
from flask_login import login_user, login_required, logout_user, current_user

from .models import User
import requests

auth = Blueprint('auth', __name__)


@auth.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email = email).first()
        if user:
            if check_password_hash(user.password, password):
                 flash('Sign In successfull!!!', category='success')
                 login_user(user, remember=True)
                 return redirect(url_for('views.home'))
            else:
                flash('Incorrect password, try again', category='error')
        else:
            flash('Email does not exist', category='error')

    return render_template("signin.html", user = current_user)

@auth.route('logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.signin'))

@auth.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        cPassword = request.form.get('cpassword')
        fName = request.form.get('fname')
        lName = request.form.get('lname')

        exists = db.session.query(db.exists().where(User.email == email)).scalar()
        if exists:
            flash("The email was used!!!", category='error')
        elif len(email) < 7:
            flash('Email must be greater than 4 characters.', category='error')
        elif len(fName) < 2:
            flash('First Name must be greater than 1 characters.', category='error')
        elif password != cPassword:
            flash('Passwords don\'t match.', category='error')
        elif len(password) < 7:
            flash('Passwords at least 7 characters.', category='error')
        else:
            new_user = User(email = email, password = generate_password_hash(password, method='sha256'), fname = fName, lname = lName)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            flash('Account created!', category='success')
            return redirect(url_for('views.home'))
    return render_template("signup.html", user = current_user)

@auth.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    sendEmail()
    return render_template("forgot_password.html", user = current_user)
