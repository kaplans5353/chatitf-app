import User from "../models/User.js"; 
import {generateToken}   from "../lib/utils.js"  ;             // User modelini import ediyor (mongoose)
import bcrypt from "bcryptjs";                         // Şifre hash’lemek için bcryptjs

export const signup = async (req, res) =>{             // signup controller fonksiyonu (async çünkü db'ye gidecek)
    const {fullName, email, password} =req.body        // req.body’den fullName, email, password alınıyor (boşluk yok diye hata verebilir ama çalışır)
        //res.send("Signup")                               // test için vardı, şimdi kapalı
         try {                                         // try-catch başladı, hata olursa catch’e düşecek
            if(!fullName || !email || !password){      // 3 alandan biri bile eksikse hata ver
                return res.status(400).json({message: "All fields are required"})
            }

            if(password.length < 6 ){                  // şifre 6 karakterden küçükse hata ver (mesaj çok sert amk)
                return res.status(400).json({message: "Password 6 rakamdan kucuk olaamaz sıkerım"})
            }

            //email kontrol
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // email formatı regex’i tanımlandı
            if (!emailRegex.test(email)) {             // email regex’e uymuyorsa hata ver
            return res.status(400).json({ message: "Geçerli bir email adresi gir lan" });
           }

           // Email zaten var mı kontrol (db)
            const existingUser = await User.findOne({ email });     // db’de aynı email var mı bakıyor
                if (existingUser) {                                // varsa hata ver
                return res.status(400).json({ message: "Bu email zaten kayıtlı piç" });
            }

            const user = await User.findOne({email});      // YUKARIDAKİ İLE AYNI KONTROLÜ BİR DAHA YAPIYOR (gereksiz tekrar amk)
            if(user) return res.status(400).json({message: "email already exisist"})  // aynı kontrol bir daha, kod tekrarı var

                const salt = await bcrypt.genSalt(10)      // bcrypt için 10 turluk salt üretiliyor
                const hashedPassword = await bcrypt.hash(password, salt)  // şifre hash’leniyor

                const newUser =new User({                  // yeni kullanıcı nesnesi yaratılıyor
                    fullName,                              // shorthand (fullName: fullName)
                    email,                                 // email: email
                    password:hashedPassword                // hash’lenmiş şifre db’ye gidecek
                })

                if(newUser){                               // newUser nesnesi oluşmuş mu kontrol (her zaman oluşur zaten)
                    generateToken(newUser._id, res)        // JWT token üretip cookie’ye yazıyor (ama generateToken fonksiyonu tanımlı değil henüz!)
                    await newUser.save()                   // kullanıcıyı veritabanına kaydediyor

                    res.status(201).json({                 // başarılı cevap dönüyor
                        _id:newUser._id,
                        fullName:newUser.fullName,
                        email:newUser.email,
                        profilePic:newUser.profilePic,     // profilePic yoksa undefined döner ama sorun değil
                    })

                }else{                                     // buraya asla düşmez (newUser her zaman var)
                   res.status(400).json({message: "Invalid user data"})
                }

         } catch (error) {                             // her türlü hata buraya düşer
            console.log("error in signup controller", error)  // hatayı konsola basıyor
            res.status(500).json({message: "ınternet server error"})  // client’a 500 hatası dönüyor (internal yazılmış yanlış ama çalışır)
         }
    }