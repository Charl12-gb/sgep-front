/* eslint-disable */
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, ImageRun, AlignmentType } from 'docx'

class ReportGenerator {
  constructor() {
    this.logoBase64 = null
    this.loadLogo()
  }

  // Charger le logo en base64
  async loadLogo() {
    try {
      const response = await fetch('/logo-benin.png') // Ajustez le chemin selon votre logo
      if (response.ok) {
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          this.logoBase64 = reader.result
        }
        reader.readAsDataURL(blob)
      }
    } catch (error) {
      console.warn('Logo non trouvé, génération sans logo')
    }
  }

  // Informations de l'application
  getAppInfo() {
    return {
      name: 'SGEP - Système de Gestion des Entreprises Publiques',
      ministry: 'MINISTÈRE DE L\'ÉCONOMIE ET DES FINANCES',
      country: 'RÉPUBLIQUE DU BÉNIN',
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      })
    }
  }

  // Formatter les en-têtes de colonnes
  formatColumnHeader(columnName) {
    if (!columnName) return ''
    
    // Dictionnaire de traduction des colonnes
    const columnTranslations = {
      'numero': 'N°',
      'nom_entite': 'Nom de l\'Entité',
      'sigle': 'Sigle',
      'statut': 'Statut',
      'tutelle': 'Tutelle',
      'secteur': 'Secteur d\'Activité',
      'capital_social': 'Capital Social',
      'objet': 'Objet Social',
      'date_creation': 'Date de Création',
      'adresse': 'Adresse',
      'telephone': 'Téléphone',
      'email': 'Email',
      'directeur_general': 'Directeur Général',
      'president_ca': 'Président du CA',
      'forme_juridique': 'Forme Juridique',
      'activite_principale': 'Activité Principale',
      'chiffre_affaire': 'Chiffre d\'Affaires',
      'effectif': 'Effectif',
      'siege_social': 'Siège Social',
      'date_derniere_ag': 'Dernière AG',
      'situation_financiere': 'Situation Financière'
    }

    // Vérifier si une traduction existe
    const translated = columnTranslations[columnName.toLowerCase()]
    if (translated) return translated

    // Sinon, formatter automatiquement
    return columnName
      .replace(/_/g, ' ') // Remplacer les underscores par des espaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Préparer les données avec en-têtes formatés
  prepareTableData(data) {
    if (!data || data.length === 0) return { headers: [], rows: [] }

    const firstRow = data[0]
    const headers = Object.keys(firstRow).map(key => this.formatColumnHeader(key))
    const rows = data.map(row => Object.values(row))

    return { headers, rows }
  }

  // Générer PDF
  async generatePDF(reportData, config) {
    const doc = new jsPDF()
    const appInfo = this.getAppInfo()
    let yPos = 20

    // Header avec logo
    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'PNG', 20, 10, 30, 20)
    }
    
    // Titre principal
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(appInfo.ministry, 60, 20)
    doc.text(appInfo.country, 60, 28)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(appInfo.name, 60, 36)

    // Ligne de séparation
    doc.setDrawColor(34, 139, 34)
    doc.setLineWidth(2)
    doc.line(20, 45, 190, 45)

    yPos = 55

    // Titre du rapport
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(config.title || 'Rapport', 20, yPos)
    yPos += 15

    // Date de génération
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Généré le : ${appInfo.date}`, 20, yPos)
    yPos += 15

        // Tableau des données
    if (reportData.preview_data && reportData.preview_data.length > 0) {
      const tableData = this.prepareTableData(reportData.preview_data)

      doc.autoTable({
        head: [tableData.headers],
        body: tableData.rows,
        startY: yPos,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          halign: 'left'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15 }, // N°
          1: { cellWidth: 'auto', minCellWidth: 30 }, // Nom entité
          2: { cellWidth: 20 }, // Sigle
          3: { cellWidth: 25 }, // Statut
          4: { cellWidth: 25 }, // Tutelle
          5: { cellWidth: 30 }, // Secteur
          6: { cellWidth: 25 }, // Capital
          7: { cellWidth: 'auto', minCellWidth: 35 }, // Objet
          8: { cellWidth: 25 } // Date création
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'wrap'
      })

      yPos = doc.lastAutoTable.finalY + 10
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Page ${i} sur ${pageCount}`, 20, 285)
      doc.text(`Total: ${reportData.total_records || 0} enregistrements`, 100, 285)
      doc.text(appInfo.name, 20, 290)
    }

    return doc
  }

  // Générer Excel
  generateExcel(reportData, config) {
    const appInfo = this.getAppInfo()
    const workbook = XLSX.utils.book_new()
    
    // Feuille de données principales
    if (reportData.preview_data && reportData.preview_data.length > 0) {
      const tableData = this.prepareTableData(reportData.preview_data)
      
      // Créer la feuille avec en-têtes formatés
      const wsData = [
        [appInfo.ministry],
        [appInfo.country],
        [appInfo.name],
        [''],
        [config.title || 'Rapport'],
        [`Généré le : ${appInfo.date}`],
        [`Total: ${reportData.total_records || 0} enregistrements`],
        [''],
        tableData.headers,
        ...tableData.rows
      ]
      
      const worksheet = XLSX.utils.aoa_to_sheet(wsData)
      
      // Formatter les en-têtes (ligne 9, index 8)
      const headerRowIndex = 8
      tableData.headers.forEach((header, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex })
        if (!worksheet[cellRef]) worksheet[cellRef] = {}
        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2980B9" } },
          alignment: { horizontal: "center" }
        }
      })

      // Ajuster la largeur des colonnes
      const colWidths = tableData.headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...tableData.rows.map(row => String(row[index] || '').length)
        )
        return { wch: Math.min(Math.max(maxLength + 2, 10), 50) }
      })
      worksheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Données')
    }

    // Feuille d'informations
    const infoSheet = XLSX.utils.aoa_to_sheet([
      ['INFORMATIONS DU RAPPORT'],
      [''],
      ['Application', appInfo.name],
      ['Ministère', appInfo.ministry],
      ['Pays', appInfo.country],
      ['Date de génération', appInfo.date],
      ['Titre du rapport', config.title || 'Rapport'],
      ['Format', config.format],
      ['Nombre d\'enregistrements', reportData.total_records || 0]
    ])

    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Informations')

    return workbook
  }

  // Générer Word
  async generateWord(reportData, config) {
    const appInfo = this.getAppInfo()
    
    const children = [
      // En-tête
      new Paragraph({
        children: [
          new TextRun({
            text: appInfo.ministry,
            bold: true,
            size: 32
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: appInfo.country,
            bold: true,
            size: 28
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: appInfo.name,
            size: 24
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '' }), // Ligne vide
      
      // Titre du rapport
      new Paragraph({
        children: [
          new TextRun({
            text: config.title || 'Rapport',
            bold: true,
            size: 36
          })
        ],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '' }),
      
      // Informations
      new Paragraph({
        children: [
          new TextRun({
            text: `Généré le : ${appInfo.date}`,
            size: 20
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Total : ${reportData.total_records || 0} enregistrements`,
            size: 20
          })
        ]
      }),
      new Paragraph({ text: '' })
    ]

    // Tableau des données
    if (reportData.preview_data && reportData.preview_data.length > 0) {
      const tableData = this.prepareTableData(reportData.preview_data)
      
      // En-tête du tableau
      const headerRow = new TableRow({
        children: tableData.headers.map(header => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ 
                text: String(header), 
                bold: true,
                color: "FFFFFF",
                size: 20
              })]
            })],
            shading: {
              fill: "2980B9"
            }
          })
        )
      })

      // Lignes de données
      const dataRows = tableData.rows.slice(0, 50).map(row => // Limiter à 50 lignes pour Word
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ 
                  text: String(cell || ''),
                  size: 18
                })]
              })]
            })
          )
        })
      )

      const table = new Table({
        rows: [headerRow, ...dataRows]
      })

      children.push(table)
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    })

    return doc
  }

  // Télécharger le fichier
  async downloadReport(reportData, config) {
    try {
      const filename = this.generateFilename(config)
      
      switch (config.format) {
        case 'pdf':
          const pdf = await this.generatePDF(reportData, config)
          pdf.save(`${filename}.pdf`)
          break
          
        case 'excel':
          const excel = this.generateExcel(reportData, config)
          XLSX.writeFile(excel, `${filename}.xlsx`)
          break
          
        case 'word':
          const word = await this.generateWord(reportData, config)
          const buffer = await Packer.toBlob(word)
          this.downloadBlob(buffer, `${filename}.docx`)
          break
          
        default:
          throw new Error(`Format non supporté: ${config.format}`)
      }
      
      return { success: true, filename }
    } catch (error) {
      console.error('Erreur de génération:', error)
      throw error
    }
  }

  // Générer un nom de fichier
  generateFilename(config) {
    const date = new Date().toISOString().split('T')[0]
    const title = (config.title || 'rapport')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
    
    return `sgep_${title}_${date}`
  }

  // Télécharger un blob
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export default new ReportGenerator()
