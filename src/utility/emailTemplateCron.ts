export const emailTemplateCron = (emailDetails: any) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body style="background-color:#dbddde;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:37.5em;margin:30px auto;width:610px;background-color:#fff;border-radius:5px;overflow:hidden">
      <tr style="width:100%">
        <td>
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td>
                  <img alt="Google Play" src="https://firebasestorage.googleapis.com/v0/b/order-app-41e22.appspot.com/o/static%2Fheader.png?alt=media&token=3667a593-2a88-40c0-9fde-9e93c8e595c2%27" width="300" height="101" style="display:block;outline:none;border:none;text-decoration:none;padding:0 40px" />
                </td>
              </tr>
            </tbody>
          </table>
          <table style="padding:0 40px" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td>
                  <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#e8eaed;margin:20px 0" />
                  <p style="font-size:14px;line-height:26px;margin:16px 0;font-weight:700;color:#004dcf">Request Status Alert</p>
                  <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Hello, ${emailDetails.requester}</p>
                  <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">The status of your order for ${emailDetails.productName} hasn't been changed for the past 24 hours.</p>
                  <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Request ID: ${emailDetails.reqId}</p>

                  <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Date: ${emailDetails.date}</p>
                </td>
              </tr>
            </tbody>
          </table>
          <table style="padding:0 40px" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td>
                <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Thanks & Regards</p>
                <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Import Team</p>
                <p style="font-size:20px;line-height:22px;margin:16px 0;color:#3c4043">Al Ahrar Hotel Supplies</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};
