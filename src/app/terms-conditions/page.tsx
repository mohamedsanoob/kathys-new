import Link from "next/link";
import Head from "next/head";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Head>
        <title>Terms and Conditions | Kathy&apos;s Clothing Store</title>
        <meta
          name="description"
          content="Read our comprehensive terms and conditions for online shopping at Kathy's Clothing Store"
        />
      </Head>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          Terms and Conditions
        </h1>
        <p className="text-gray-600 mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Overview
          </h2>
          <p className="mb-4">
            This website is operated by Kathy&apos;s Clothing Store. Throughout the site, 
            the terms &quot;we&quot;, &quot;us&quot; and &quot;our&quot; refer to Kathy&apos;s Clothing Store. 
            We offer this website, including all information, tools and services 
            available from this site to you, the user, conditioned upon your 
            acceptance of all terms, conditions, policies and notices stated here.
          </p>
          <p className="mb-4">
            By visiting our site and/or purchasing something from us, you engage 
            in our &quot;Service&quot; and agree to be bound by the following terms and 
            conditions (&quot;Terms of Service&quot;, &quot;Terms&quot;), including those additional 
            terms and conditions and policies referenced herein and/or available 
            by hyperlink. These Terms of Service apply to all users of the site, 
            including without limitation users who are browsers, vendors, customers, 
            merchants, and/or contributors of content.
          </p>
          <p className="mb-4">
            Please read these Terms of Service carefully before accessing or using 
            our website. By accessing or using any part of the site, you agree to 
            be bound by these Terms of Service. If you do not agree to all the 
            terms and conditions of this agreement, then you may not access the 
            website or use any services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 1 - Online Store Terms
          </h2>
          <p className="mb-4">
            By agreeing to these Terms of Service, you represent that you are at 
            least the age of majority in your state or province of residence, or 
            that you are the age of majority in your state or province of residence 
            and you have given us your consent to allow any of your minor dependents 
            to use this site.
          </p>
          <p className="mb-4">
            You may not use our products for any illegal or unauthorized purpose 
            nor may you, in the use of the Service, violate any laws in your 
            jurisdiction (including but not limited to copyright laws).
          </p>
          <p className="mb-4">
            You must not transmit any worms or viruses or any code of a destructive nature.
          </p>
          <p className="mb-4">
            A breach or violation of any of the Terms will result in an immediate 
            termination of your Services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 2 - General Conditions
          </h2>
          <p className="mb-4">
            We reserve the right to refuse service to anyone for any reason at any time.
          </p>
          <p className="mb-4">
            You understand that your content (not including credit card information), 
            may be transferred unencrypted and involve (a) transmissions over various 
            networks; and (b) changes to conform and adapt to technical requirements 
            of connecting networks or devices. Credit card information is always 
            encrypted during transfer over networks.
          </p>
          <p className="mb-4">
            You agree not to reproduce, duplicate, copy, sell, resell or exploit 
            any portion of the Service, use of the Service, or access to the Service 
            or any contact on the website through which the service is provided, 
            without express written permission by us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 3 - Orders, Payments and Pricing
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              All orders are subject to availability and confirmation of the order price.
            </li>
            <li>
              We accept payments through Razorpay. By completing a transaction, 
              you confirm that the payment method is yours or you have authorization to use it.
            </li>
            <li>
              Prices are shown in Indian Rupees (INR) and include GST where applicable.
            </li>
            <li>
              Prices for our products are subject to change without notice.
            </li>
            <li>
              We reserve the right at any time to modify or discontinue the Service 
              (or any part or content thereof) without notice at any time.
            </li>
            <li>
              We shall not be liable to you or to any third-party for any modification, 
              price change, suspension or discontinuance of the Service.
            </li>
            <li>
              We reserve the right to refuse or cancel any order for any reason, 
              including limitations on quantities available for purchase.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 4 - Products and Services
          </h2>
          <p className="mb-4">
            Certain products or services may be available exclusively online through 
            the website. These products or services may have limited quantities and 
            are subject to return or exchange only according to our Return Policy.
          </p>
          <p className="mb-4">
            We have made every effort to display as accurately as possible the colors 
            and images of our products that appear at the store. We cannot guarantee 
            that your computer monitor&apos;s display of any color will be accurate.
          </p>
          <p className="mb-4">
            We reserve the right, but are not obligated, to limit the sales of our 
            products or Services to any person, geographic region or jurisdiction. 
            We may exercise this right on a case-by-case basis.
          </p>
          <p className="mb-4">
            We do not warrant that the quality of any products, services, information, 
            or other material purchased or obtained by you will meet your expectations, 
            or that any errors in the Service will be corrected.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 5 - Shipping and Delivery
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              We aim to dispatch all orders within 1-2 business days of order confirmation.
            </li>
            <li>
              Delivery times are estimates and not guaranteed. We are not responsible 
              for delays caused by third-party shipping providers.
            </li>
            <li>
              Risk of loss and title for items pass to you upon delivery to the carrier.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 6 - Accuracy of Billing and Account Information
          </h2>
          <p className="mb-4">
            We reserve the right to refuse any order you place with us. We may, in 
            our sole discretion, limit or cancel quantities purchased per person, 
            per household or per order. These restrictions may include orders placed 
            by or under the same customer account, the same credit card, and/or orders 
            that use the same billing and/or shipping address.
          </p>
          <p className="mb-4">
            You agree to provide current, complete and accurate purchase and account 
            information for all purchases made at our store. You agree to promptly 
            update your account and other information, including your email address 
            and credit card numbers and expiration dates, so that we can complete 
            your transactions and contact you as needed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 7 - Returns and Refunds
          </h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>
              Please refer to our{" "}
              <Link
                href="/refund-policy"
                className="text-blue-600 hover:underline"
              >
                Refund Policy
              </Link>{" "}
              for complete details on returns and refunds.
            </li>
            <li>
              Items must be returned in their original condition with all tags attached.
            </li>
            <li>
              Refunds will be processed through the original payment method via Razorpay.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 8 - Third-Party Links and Optional Tools
          </h2>
          <p className="mb-4">
            Certain content, products and services available via our Service may 
            include materials from third-parties. Third-party links on this site 
            may direct you to third-party websites that are not affiliated with us.
          </p>
          <p className="mb-4">
            We are not responsible for examining or evaluating the content or 
            accuracy and we do not warrant and will not have any liability or 
            responsibility for any third-party materials or websites, or for any 
            other materials, products, or services of third-parties.
          </p>
          <p className="mb-4">
            We may provide you with access to third-party tools over which we 
            neither monitor nor have any control nor input. Any use by you of 
            optional tools offered through the site is entirely at your own risk 
            and discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 9 - User Comments, Feedback and Other Submissions
          </h2>
          <p className="mb-4">
            If, at our request, you send certain specific submissions (for example 
            contest entries) or without a request from us you send creative ideas, 
            suggestions, proposals, plans, or other materials, whether online, by 
            email, by postal mail, or otherwise (collectively, &apos;comments&apos;), you 
            agree that we may, at any time, without restriction, edit, copy, publish, 
            distribute, translate and otherwise use in any medium any comments that 
            you forward to us.
          </p>
          <p className="mb-4">
            We may, but have no obligation to, monitor, edit or remove content that 
            we determine in our sole discretion are unlawful, offensive, threatening, 
            libelous, defamatory, pornographic, obscene or otherwise objectionable 
            or violates any party&apos;s intellectual property or these Terms of Service.
          </p>
          <p className="mb-4">
            You agree that your comments will not violate any right of any third-party, 
            including copyright, trademark, privacy, personality or other personal 
            or proprietary right.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 10 - Personal Information and Privacy
          </h2>
          <p className="mb-4">
            Your submission of personal information through the store is governed 
            by our Privacy Policy. Your privacy is important to us. Please review our{" "}
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            to understand how we collect, use, and protect your personal information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 11 - Errors, Inaccuracies and Omissions
          </h2>
          <p className="mb-4">
            Occasionally there may be information on our site or in the Service 
            that contains typographical errors, inaccuracies or omissions that may 
            relate to product descriptions, pricing, promotions, offers, product 
            shipping charges, transit times and availability.
          </p>
          <p className="mb-4">
            We reserve the right to correct any errors, inaccuracies or omissions, 
            and to change or update information or cancel orders if any information 
            in the Service or on any related website is inaccurate at any time 
            without prior notice (including after you have submitted your order).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 12 - Prohibited Uses
          </h2>
          <p className="mb-4">
            In addition to other prohibitions as set forth in the Terms of Service, 
            you are prohibited from using the site or its content:
          </p>
          <ul className="list-disc pl-6 space-y-1 mb-4">
            <li>for any unlawful purpose</li>
            <li>to solicit others to perform or participate in any unlawful acts</li>
            <li>to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances</li>
            <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>to submit false or misleading information</li>
            <li>to upload or transmit viruses or any other type of malicious code</li>
            <li>to collect or track the personal information of others</li>
            <li>to spam, phish, pharm, pretext, spider, crawl, or scrape</li>
            <li>for any obscene or immoral purpose</li>
            <li>to interfere with or circumvent the security features of the Service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 13 - Intellectual Property
          </h2>
          <p className="mb-4">
            All content on this website, including images, text, logos, and designs, 
            are the property of Kathy&apos;s Clothing Store and are protected by 
            copyright laws. You may not reproduce, distribute, or create derivative 
            works from our content without express written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 14 - Disclaimer of Warranties; Limitation of Liability
          </h2>
          <p className="mb-4">
            We do not guarantee, represent or warrant that your use of our service 
            will be uninterrupted, timely, secure or error-free. We do not warrant 
            that the results that may be obtained from the use of the service will 
            be accurate or reliable.
          </p>
          <p className="mb-4">
            You expressly agree that your use of, or inability to use, the service 
            is at your sole risk. The service and all products and services delivered 
            to you through the service are (except as expressly stated by us) provided 
            &apos;as is&apos; and &apos;as available&apos; for your use, without any representation, 
            warranties or conditions of any kind, either express or implied.
          </p>
          <p className="mb-4">
            In no case shall Kathy&apos;s Clothing Store, our directors, officers, 
            employees, affiliates, agents, contractors, interns, suppliers, service 
            providers or licensors be liable for any injury, loss, claim, or any 
            direct, indirect, incidental, punitive, special, or consequential damages 
            of any kind, including, without limitation lost profits, lost revenue, 
            lost savings, loss of data, replacement costs, or any similar damages, 
            whether based in contract, tort (including negligence), strict liability 
            or otherwise.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 15 - Indemnification
          </h2>
          <p className="mb-4">
            You agree to indemnify, defend and hold harmless Kathy&apos;s Clothing Store 
            and our parent, subsidiaries, affiliates, partners, officers, directors, 
            agents, contractors, licensors, service providers, subcontractors, suppliers, 
            interns and employees, harmless from any claim or demand, including reasonable 
            attorneys&apos; fees, made by any third-party due to or arising out of your 
            breach of these Terms of Service or the documents they incorporate by 
            reference, or your violation of any law or the rights of a third-party.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 16 - Severability
          </h2>
          <p className="mb-4">
            In the event that any provision of these Terms of Service is determined 
            to be unlawful, void or unenforceable, such provision shall nonetheless 
            be enforceable to the fullest extent permitted by applicable law, and 
            the unenforceable portion shall be deemed to be severed from these Terms 
            of Service, such determination shall not affect the validity and enforceability 
            of any other remaining provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 17 - Termination
          </h2>
          <p className="mb-4">
            The obligations and liabilities of the parties incurred prior to the 
            termination date shall survive the termination of this agreement for 
            all purposes. These Terms of Service are effective unless and until 
            terminated by either you or us.
          </p>
          <p className="mb-4">
            If in our sole judgment you fail, or we suspect that you have failed, 
            to comply with any term or provision of these Terms of Service, we also 
            may terminate this agreement at any time without notice and you will 
            remain liable for all amounts due up to and including the date of termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 18 - Entire Agreement
          </h2>
          <p className="mb-4">
            The failure of us to exercise or enforce any right or provision of these 
            Terms of Service shall not constitute a waiver of such right or provision. 
            These Terms of Service and any policies or operating rules posted by us 
            on this site or in respect to The Service constitutes the entire agreement 
            and understanding between you and us and govern your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 19 - Governing Law
          </h2>
          <p className="mb-4">
            These Terms shall be governed by and construed in accordance with the 
            laws of India. Any disputes shall be subject to the exclusive jurisdiction 
            of the courts in Alappuzha, Kerala.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 20 - Changes to Terms of Service
          </h2>
          <p className="mb-4">
            You can review the most current version of the Terms of Service at any 
            time at this page. We reserve the right, at our sole discretion, to 
            update, change or replace any part of these Terms of Service by posting 
            updates and changes to our website. It is your responsibility to check 
            our website periodically for changes. Your continued use of or access 
            to our website or the Service following the posting of any changes to 
            these Terms of Service constitutes acceptance of those changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Section 21 - Contact Information
          </h2>
          <p className="mb-4">
            Questions about the Terms of Service should be sent to us at:
          </p>
          <p>
            Email:{" "}
            <a
              href="mailto:customercare@kathysonline.in"
              className="text-blue-600 hover:underline"
            >
              customercare@kathysonline.in
            </a>
            <br />
            Phone: +91 9876543210
            <br />
            Address: Alappuzha, Kerala, India - 560001
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;