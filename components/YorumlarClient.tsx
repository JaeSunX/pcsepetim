'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, Send, Edit2, Trash2, User } from 'lucide-react'

interface Yorum {
  id: string
  icerik: string
  puan: number | null
  olusturma: string
  kullanici: {
    id: string
    ad: string
    avatar: string | null
  }
}

interface YorumlarClientProps {
  ilanId: string
}

export default function YorumlarClient({ ilanId }: YorumlarClientProps) {
  const { data: session } = useSession()
  const [yorumlar, setYorumlar] = useState<Yorum[]>([])
  const [yeniYorum, setYeniYorum] = useState('')
  const [puan, setPuan] = useState<number | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [yorumYukleniyor, setYorumYukleniyor] = useState(false)
  const [duzenlenenYorum, setDuzenlenenYorum] = useState<string | null>(null)
  const [duzenlemeIcerik, setDuzenlemeIcerik] = useState('')
  const [duzenlemePuan, setDuzenlemePuan] = useState<number | null>(null)

  // Yorumları getir
  const yorumlariGetir = async () => {
    try {
      const response = await fetch(`/api/yorumlar?ilanId=${ilanId}`)
      if (response.ok) {
        const data = await response.json()
        setYorumlar(data.yorumlar)
      }
    } catch (error) {
      console.error('Yorumlar getirilirken hata:', error)
    }
  }

  useEffect(() => {
    yorumlariGetir()
  }, [ilanId])

  // Yeni yorum ekle
  const yorumEkle = async () => {
    if (!yeniYorum.trim() || !session) return

    setYukleniyor(true)
    try {
      const response = await fetch('/api/yorumlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ilanId,
          icerik: yeniYorum.trim(),
          puan,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setYorumlar([data.yorum, ...yorumlar])
        setYeniYorum('')
        setPuan(null)
      } else {
        const error = await response.json()
        alert(error.hata || 'Yorum eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Yorum ekleme hatası:', error)
      alert('Yorum eklenirken hata oluştu')
    } finally {
      setYukleniyor(false)
    }
  }

  // Yorumu düzenle
  const yorumuDuzenle = async (yorumId: string) => {
    if (!duzenlemeIcerik.trim()) return

    setYorumYukleniyor(true)
    try {
      const response = await fetch(`/api/yorumlar/${yorumId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icerik: duzenlemeIcerik.trim(),
          puan: duzenlemePuan,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setYorumlar(yorumlar.map(y => y.id === yorumId ? data.yorum : y))
        setDuzenlenenYorum(null)
        setDuzenlemeIcerik('')
        setDuzenlemePuan(null)
      } else {
        const error = await response.json()
        alert(error.hata || 'Yorum düzenlenirken hata oluştu')
      }
    } catch (error) {
      console.error('Yorum düzenleme hatası:', error)
      alert('Yorum düzenlenirken hata oluştu')
    } finally {
      setYorumYukleniyor(false)
    }
  }

  // Yorumu sil
  const yorumuSil = async (yorumId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/yorumlar/${yorumId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setYorumlar(yorumlar.filter(y => y.id !== yorumId))
      } else {
        const error = await response.json()
        alert(error.hata || 'Yorum silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Yorum silme hatası:', error)
      alert('Yorum silinirken hata oluştu')
    }
  }

  // Düzenleme moduna geç
  const duzenlemeyeBasla = (yorum: Yorum) => {
    setDuzenlenenYorum(yorum.id)
    setDuzenlemeIcerik(yorum.icerik)
    setDuzenlemePuan(yorum.puan)
  }

  // Düzenlemeyi iptal et
  const duzenlemeyiIptalEt = () => {
    setDuzenlenenYorum(null)
    setDuzenlemeIcerik('')
    setDuzenlemePuan(null)
  }

  // Yıldız render fonksiyonu
  const renderYildizlar = (puan: number | null, editable = false, onChange?: (puan: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!editable}
            onClick={() => editable && onChange && onChange(star)}
            className={`text-lg ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={16}
              className={`${
                puan && star <= puan
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Yorumlar ({yorumlar.length})</h2>

      {/* Yeni yorum ekleme */}
      {session ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-3">Yorum Yaz</h3>

          {/* Puan verme */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-2">Puanınız (isteğe bağlı)</label>
            {renderYildizlar(puan, true, setPuan)}
          </div>

          {/* Yorum metni */}
          <textarea
            value={yeniYorum}
            onChange={(e) => setYeniYorum(e.target.value)}
            placeholder="Bu ilan hakkında düşüncelerinizi paylaşın..."
            className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            maxLength={500}
          />

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{yeniYorum.length}/500</span>
            <button
              onClick={yorumEkle}
              disabled={!yeniYorum.trim() || yukleniyor}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Send size={16} />
              {yukleniyor ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl text-center">
          <p className="text-blue-600 font-medium">Yorum yapmak için giriş yapın</p>
          <a href="/giris" className="text-primary-600 hover:text-primary-700 text-sm mt-1 inline-block">
            Giriş Yap →
          </a>
        </div>
      )}

      {/* Yorum listesi */}
      <div className="space-y-4">
        {yorumlar.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Henüz yorum yapılmamış</p>
            <p className="text-sm mt-1">İlk yorumu siz yapın!</p>
          </div>
        ) : (
          yorumlar.map((yorum) => (
            <div key={yorum.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  {yorum.kullanici.avatar ? (
                    <img
                      src={yorum.kullanici.avatar}
                      alt={yorum.kullanici.ad}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-primary-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Kullanıcı adı ve tarih */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{yorum.kullanici.ad}</span>
                      {yorum.puan && renderYildizlar(yorum.puan)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{new Date(yorum.olusturma).toLocaleDateString('tr-TR')}</span>

                      {/* Düzenleme/Silme butonları */}
                      {session?.user?.email && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => duzenlemeyeBasla(yorum)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => yorumuSil(yorum.id)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Yorum içeriği */}
                  {duzenlenenYorum === yorum.id ? (
                    <div className="space-y-3">
                      {/* Düzenleme puanı */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Puan</label>
                        {renderYildizlar(duzenlemePuan, true, setDuzenlemePuan)}
                      </div>

                      {/* Düzenleme metni */}
                      <textarea
                        value={duzenlemeIcerik}
                        onChange={(e) => setDuzenlemeIcerik(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded resize-none focus:ring-1 focus:ring-primary-500"
                        rows={3}
                        maxLength={500}
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={duzenlemeyiIptalEt}
                          className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => yorumuDuzenle(yorum.id)}
                          disabled={yorumYukleniyor}
                          className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 disabled:bg-gray-300"
                        >
                          {yorumYukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{yorum.icerik}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}