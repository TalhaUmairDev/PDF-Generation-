document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.wpcf7 form');
    const downloadButton = document.getElementById('download-pdf');
    const emailButton = document.getElementById('email-pdf');
    const acceptanceField = form.querySelector('input[name="acceptance-1"]'); // Adjust the name if necessary

    function updateButtonVisibility() {
        const allFieldsFilled = [...form.querySelectorAll('input, textarea, select')]
            .filter(field => field.type !== 'hidden' && field.name !== 'Titel') // Skip hidden fields and the "Titel" field
            .every(field => {
                if (field.type === 'checkbox') {
                    return field.checked;
                } else {
                    return field.value.trim() !== '';
                }
            });

        if (allFieldsFilled && acceptanceField && acceptanceField.checked) {
            downloadButton.style.display = 'block';
            emailButton.style.display = 'block';
        } else {
            downloadButton.style.display = 'none';
            emailButton.style.display = 'none';
        }
    }

    form.addEventListener('input', updateButtonVisibility);
    form.addEventListener('change', updateButtonVisibility);

    updateButtonVisibility();

    downloadButton.addEventListener('click', downloadPDF);
    emailButton.addEventListener('click', sendPDFByEmail);

    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const formData = new FormData(form);

        // Get the selected radio button value
        function getSelectedRadio(name) {
            const selectedRadio = form.querySelector(`input[name="${name}"]:checked`);
            return selectedRadio ? selectedRadio.value : '';
        }

        // Get the current date
        const currentDate = new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });

        const htmlTemplate = `
            <div class="main-outer">
                <div class="inner-contain">
                    <div class="left-are">
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('ZustndigeBehrde') || ''}</p>
                        <p style="line-height: 10px !important;" class="pdf-text"><b>${formData.get('NamederzustndigenBehrde') || ''}</b></p>
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('Strae') || ''} ${formData.get('HausNr') || ''}</p>
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('PLZ') || ''} ${formData.get('Ort') || ''}</p>
                    </div>
                    <div class="right-area">
                        <p style="line-height: 10px !important;" class="pdf-text"><b>${getSelectedRadio('Anrede')} ${formData.get('Titel') || ''} ${formData.get('Vorname') || ''} ${formData.get('Nachname') || ''}</b></p>
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('IhreStrae') || ''} ${formData.get('IhreHausNr') || ''}</p>
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('IhrePLZ') || ''} ${formData.get('IhreOrt') || ''}</p>
                        <p style="line-height: 10px !important;" class="pdf-text">${formData.get('Kundennummer') || ''}</p>
                    </div>
                </div>
                
                <div class="inner-contain">
                    <h5 class="pdf-heading">Antrag auf Aktivierungs- und Vermittlungsgutschein <br /> (AVGS ) für private Arbeitsvermittlung</h5>
                    <p class="pdf-text">Sehr geehrte Damen und Herren,</p>
                    <p class="pdf-text">ich beantrage hiermit gemäß § 323 SGB III einen Aktivierungs- und Vermittlungsgutschein für die private Arbeitsvermittlung (AVGS MPAV). Bitte bearbeiten Sie meinen Antrag, wenn möglich, umgehend gemäß § 4 SGB III, der den Vorrang der Vermittlung regelt.</p>
                </div>
                
                <div class="inner-contain">
                    <div class="col-bor">
                        <p class="pdf-text"><b>Meine derzeitige Situation:</b></p>
                        <p class="pdf-text">${formData.get('WastrifftausSiezu') || ''}</p>
                    </div>
                </div>

                <div class="inner-contain">
                    <p class="pdf-text">Bitte beachten Sie bei der Ausstellung des AVGS folgendes:</p>
                    <p class="pdf-text"><b>1)</b> Die Arbeitsvermittlung auf <b>""im Bundesgebiet""</b> beschränken.</p>
                    <p class="pdf-text"><b>2) Bei Verlängerung des AVGS:</b> Die Gültigkeitsdauer nahtlos an den Ablauf des vorherigen AVGS anschließen.</p>
                </div>
                
                <div class="inner-contain">
                    <p class="pdf-text">Bitte senden Sie mir den AVGS &nbsp; <b><u>per Post</u></b> oder ggf. übergeben Sie ihn mir persönlich.</p>
                    <p class="pdf-text">Sollte mein Antrag abgelehnt werden, benötige ich eine schriftliche Erklärung mit detaillierter Begründung gemäß § 35 Abs. 3 SGB X und § 39 SGB I.</p>
                    <p class="pdf-text">Vermeiden Sie bitte mündliche Absagen, sei es telefonisch oder persönlich.</p>
                    <p class="pdf-text"><b>${formData.get('IhreOrt') || ''}, ${currentDate}, ${formData.get('Titel') || ''} ${formData.get('Vorname') || ''} ${formData.get('Nachname') || ''}</b></p>
                </div>
                
                <div class="inner-contain">
                    <p class="pdf-text">
                        Ein Antrag kann persönlich, telefonisch oder schriftlich (per Brief, Fax oder E-Mail) eingereicht werden.<br />Dieses Schreiben ist <b>maschinell erstellt</b> und daher <b>ohne Unterschrift gültig</b>.
                    </p>
                </div>
            </div>
        `;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const footerText = [
            "Online-Antrag auf einen Vermittlungsgutschein - Jobvermittlung (AVGS MPAV). Ein kostenloser Service der Shariah-Invest", 
            "Jobbörse & Personalvermittlung GmbH. Link zum Antrag auf AVGS: https://shariah-invest.eu/test-form"
        ];

        function addFooter() {
            const pageHeight = doc.internal.pageSize.height;
            const x = pageWidth / 2;
            const y = pageHeight - margin;
            const lineY = y - 10;

            doc.setDrawColor(0);
            doc.setLineWidth(0.5);
            doc.line(margin, lineY, pageWidth - margin, lineY);

            doc.setFontSize(8);
            footerText.forEach((line, index) => {
                doc.text(line, x, y + (index * 5) - 5, {
                    maxWidth: pageWidth - 2 * margin,
                    align: 'center'
                });
            });
        }

        await new Promise(resolve => {
            doc.html(htmlTemplate, {
                callback: function (doc) {
                    addFooter();
                    resolve(doc);
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 700,
            });
        });

        return doc.output('blob');
    }

    function downloadPDF() {
        generatePDF().then(docBlob => {
            const url = URL.createObjectURL(docBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'AVGS_Form_Submission.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF.');
        });
    }

    async function sendPDFByEmail() {
        const email = form.querySelector('input[name="E-Mail"]').value;

        if (!email) {
            alert('Please provide an email address.');
            return;
        }

        try {
            const pdfBlob = await generatePDF();
            const emailFormData = new FormData();
            emailFormData.append('E-Mail', email);
            emailFormData.append('pdf_file', pdfBlob, 'AVGS_Form_Submission.pdf');

            const response = await fetch('https://shariah-invest.eu/email/send-pdf-email.php', {
                method: 'POST',
                body: emailFormData
            });

            const result = await response.text();
            alert(result);

            // Reset form fields after email is sent
            form.reset();
            updateButtonVisibility();
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email.');
        }
    }
});